import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
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
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stockQuantity < item.quantity) {
          throw new BadRequestException();
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: product.stockQuantity - item.quantity },
        });

        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: product.id,
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
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
