import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';

@Processor('orders')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);
  constructor(private readonly orderService: OrderService) { super(); }

  async process(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing order ${orderId}...`);
    let order = await this.orderService.getOrderById(orderId);
    if (!order || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) return;
    if (order.status === OrderStatus.NEW) await this.orderService.updateOrderStatus(orderId, OrderStatus.PROCESSING);
    order = await this.orderService.getOrderById(orderId);
    if (!order || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) return;
    if (order.status === OrderStatus.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      order = await this.orderService.getOrderById(orderId);
      if (!order || order.status === OrderStatus.CANCELLED) return;
      if (order.status === OrderStatus.PROCESSING) await this.orderService.updateOrderStatus(orderId, OrderStatus.SHIPPED);
    }
    order = await this.orderService.getOrderById(orderId);
    if (order?.status === OrderStatus.SHIPPED) await this.orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED);
    this.logger.log(`Order ${orderId} processing finished.`);
  }
}
