import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);
  private readonly statusTransitions: Record<OrderStatus, OrderStatus[]> = {
    NEW: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.COMPLETED],
    COMPLETED: [],
    CANCELLED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('orders') private readonly ordersQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    const pending = await this.prisma.order.findMany({
      where: { status: OrderStatus.NEW },
      select: { id: true },
      take: 500,
    });
    for (const order of pending) await this.enqueueOrder(order.id);
  }

  private async enqueueOrder(orderId: string) {
    try {
      await this.ordersQueue.add(
        'process-order',
        { orderId },
        {
          jobId: `order:${orderId}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      );
      return true;
    } catch (error) {
      this.logger.error(
        `QUEUE_JOB_FAILED orderId=${orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  async checkout(userId: string, idempotencyKey: string) {
    const existing = await this.prisma.checkoutRequest.findUnique({
      where: { userId_key: { userId, key: idempotencyKey } },
      include: { order: { include: { orderItems: true } } },
    });
    if (existing?.order) return existing.order;

    let order;
    try {
      order = await this.prisma.$transaction(async (tx) => {
        const request = await tx.checkoutRequest.create({
          data: { userId, key: idempotencyKey },
        });
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });
        if (!cart || cart.items.length === 0)
          throw new BadRequestException('Cart is empty');

        let totalAmount = new Prisma.Decimal(0);
        const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        for (const item of cart.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product)
            throw new BadRequestException('Product is no longer available');
          const decrement = await tx.product.updateMany({
            where: { id: product.id, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (decrement.count !== 1) {
            this.logger.warn(
              `INVENTORY_DECREMENT_REJECTED productId=${product.id} userId=${userId}`,
            );
            throw new ConflictException('Insufficient stock');
          }
          totalAmount = totalAmount.plus(product.price.mul(item.quantity));
          orderItemsData.push({
            product: { connect: { id: product.id } },
            quantity: item.quantity,
            unitPrice: product.price,
            productNameSnapshot: product.name,
          });
        }
        const createdOrder = await tx.order.create({
          data: {
            userId,
            totalAmount,
            status: OrderStatus.NEW,
            orderItems: { create: orderItemsData },
          },
          include: { orderItems: true },
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.checkoutRequest.update({
          where: { id: request.id },
          data: { orderId: createdOrder.id },
        });
        return createdOrder;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const duplicate = await this.prisma.checkoutRequest.findUnique({
          where: { userId_key: { userId, key: idempotencyKey } },
          include: { order: { include: { orderItems: true } } },
        });
        if (duplicate?.order) return duplicate.order;
      }
      throw error;
    }

    try {
      await this.cacheManager.clear();
    } catch {
      this.logger.warn(`CATALOG_CACHE_INVALIDATION_FAILED orderId=${order.id}`);
    }
    if (!(await this.enqueueOrder(order.id)))
      this.logger.warn(`ORDER_QUEUE_PENDING orderId=${order.id}`);
    this.logger.log(`ORDER_CREATED orderId=${order.id} userId=${userId}`);
    return order;
  }

  async getOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
  }
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { orderItems: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    let statusChanged = false;

    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!order) throw new NotFoundException();

      if (order.status === status) return order;

      if (!this.statusTransitions[order.status].includes(status)) {
        throw new ConflictException(
          `Invalid order status transition: ${order.status} -> ${status}`,
        );
      }

      const statusUpdate = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });

      if (statusUpdate.count !== 1) {
        throw new ConflictException(
          'Order status was changed by another request',
        );
      }

      statusChanged = true;

      if (status === OrderStatus.CANCELLED) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }

      return { ...order, status };
    });

    if (statusChanged) {
      try {
        await this.cacheManager.clear();
      } catch {
        this.logger.warn(`CATALOG_CACHE_INVALIDATION_FAILED orderId=${id}`);
      }
    }

    this.logger.log(`ORDER_STATUS_CHANGED orderId=${id} to=${status}`);

    return updated;
  }
}
