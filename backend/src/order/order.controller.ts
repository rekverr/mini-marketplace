import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@Request() req: any) {
    return this.orderService.checkout(req.user.id);
  }

  @Get()
  getUserOrders(@Request() req: any) {
    return this.orderService.getUserOrders(req.user.id);
  }
}
