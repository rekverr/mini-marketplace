import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly statusTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.NEW]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('orders') private readonly ordersQueue: Queue,
  ) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException();
    }

    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException('Product is no longer available');
        }

        const decrement = await tx.product.updateMany({
          where: {
            id: product.id,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (decrement.count !== 1) {
          this.logger.warn(
            `INVENTORY_DECREMENT_REJECTED productId=${product.id} userId=${userId}`,
          );
          throw new ConflictException('Insufficient stock');
        }

        const itemTotal = product.price.mul(item.quantity);
        totalAmount = totalAmount.plus(itemTotal);

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
          status: 'NEW',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    await this.ordersQueue.add('process-order', { orderId: order.id });
    this.logger.log(`ORDER_CREATED orderId=${order.id} userId=${userId}`);

    return order;
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
      include: {
        orderItems: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException();
    }

    if (!this.statusTransitions[order.status].includes(status)) {
      throw new ConflictException(
        `Invalid order status transition: ${order.status} -> ${status}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    this.logger.log(
      `ORDER_STATUS_CHANGED orderId=${id} from=${order.status} to=${status}`,
    );

    return updatedOrder;
  }
}
