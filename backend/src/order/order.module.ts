import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OrderProcessor } from './order.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'orders',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, OrderProcessor],
})
export class OrderModule {}
