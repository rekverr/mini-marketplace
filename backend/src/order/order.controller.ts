import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@Request() req: any) {
    return this.orderService.checkout(req.user.id);
  }

  @Get('me')
  getUserOrders(@Request() req: any) {
    return this.orderService.getUserOrders(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }
}
