import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
      include: { orderItems: true },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const totalOrders = orders.length;

    const salesByDate: Record<string, number> = {};
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + Number(order.totalAmount);

      order.orderItems.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productNameSnapshot,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue +=
          Number(item.unitPrice) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      salesByDate,
      topProducts,
    };
  }

  async getCsvExport() {
    const orders = await this.prisma.order.findMany({
      include: { user: { select: { email: true } }, orderItems: true },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Order ID,Date,User Email,Status,Total Amount,Items\n';

    orders.forEach((order) => {
      const itemsStr = order.orderItems
        .map((i) => `${i.productNameSnapshot} (x${i.quantity})`)
        .join('; ');

      csv += `${order.id},${order.createdAt.toISOString()},${order.user.email},${order.status},${order.totalAmount},"${itemsStr}"\n`;
    });

    return csv;
  }
}
