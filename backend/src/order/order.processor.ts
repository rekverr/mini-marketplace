import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('orders')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing order ${orderId}...`);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Order ${orderId} successfully COMPLETED.`);
  }
}
