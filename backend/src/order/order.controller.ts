import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post('checkout')
  checkout(@Headers('idempotency-key') key: string | undefined, @Request() req: AuthenticatedRequest) {
    if (!key?.trim()) throw new BadRequestException('Idempotency-Key header is required');
    return this.orderService.checkout(req.user.id, key.trim());
  }
  @Get('me') getUserOrders(@Request() req: AuthenticatedRequest) { return this.orderService.getUserOrders(req.user.id); }
  @UseGuards(RolesGuard) @Roles(Role.ADMIN) @Get('admin') getAllOrders() { return this.orderService.getAllOrders(); }
  @UseGuards(RolesGuard) @Roles(Role.ADMIN) @Patch('admin/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) { return this.orderService.updateOrderStatus(id, dto.status); }
}
