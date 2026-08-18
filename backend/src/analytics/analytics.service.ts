import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private getRange(from?: string, to?: string) {
    const end = to ? new Date(to) : new Date();
    const start = from
      ? new Date(from)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    )
      throw new BadRequestException('Invalid analytics date range');
    return { start, end };
  }

  async getSummary(from?: string, to?: string) {
    const { start, end } = this.getRange(from, to);
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      include: { orderItems: true },
      orderBy: { createdAt: 'asc' },
    });
    let totalRevenue = new Prisma.Decimal(0);
    const salesByDate: Record<string, Prisma.Decimal> = {};
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: Prisma.Decimal }
    > = {};
    for (const order of orders) {
      totalRevenue = totalRevenue.plus(order.totalAmount);
      const date = order.createdAt.toISOString().slice(0, 10);
      salesByDate[date] = (salesByDate[date] ?? new Prisma.Decimal(0)).plus(
        order.totalAmount,
      );
      for (const item of order.orderItems) {
        const current = productSales[item.productId] ?? {
          name: item.productNameSnapshot,
          quantity: 0,
          revenue: new Prisma.Decimal(0),
        };
        current.quantity += item.quantity;
        current.revenue = current.revenue.plus(
          item.unitPrice.mul(item.quantity),
        );
        productSales[item.productId] = current;
      }
    }
    return {
      from: start.toISOString(),
      to: end.toISOString(),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      salesByDate: Object.fromEntries(
        Object.entries(salesByDate).map(([k, v]) => [k, Number(v.toFixed(2))]),
      ),
      topProducts: Object.values(productSales)
        .sort((a, b) => b.revenue.comparedTo(a.revenue))
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          quantity: p.quantity,
          revenue: Number(p.revenue.toFixed(2)),
        })),
    };
  }

  async getCsvExport(from?: string, to?: string) {
    const { start, end } = this.getRange(from, to);
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      include: { user: { select: { email: true } }, orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows: string[][] = [
      ['Order ID', 'Date', 'User Email', 'Status', 'Total Amount', 'Items'],
    ];
    for (const order of orders)
      rows.push([
        order.id,
        order.createdAt.toISOString(),
        order.user.email,
        order.status,
        order.totalAmount.toString(),
        order.orderItems
          .map((i) => `${i.productNameSnapshot} (x${i.quantity})`)
          .join('; '),
      ]);
    return rows.map((row) => row.map(escapeCsv).join(',')).join('\n') + '\n';
  }
}
