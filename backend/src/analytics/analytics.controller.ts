import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { DateRangeDto } from './dto/date-range.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @Get('summary') getSummary(@Query() q: DateRangeDto) {
    return this.analyticsService.getSummary(q.from, q.to);
  }
  @Get('daily') async getDaily(@Query() q: DateRangeDto) {
    const s = await this.analyticsService.getSummary(q.from, q.to);
    return { from: s.from, to: s.to, salesByDate: s.salesByDate };
  }
  @Get('top-products') async getTopProducts(@Query() q: DateRangeDto) {
    return (await this.analyticsService.getSummary(q.from, q.to)).topProducts;
  }
  @Get('export.csv') async exportCsv(
    @Query() q: DateRangeDto,
    @Res() res: Response,
  ) {
    const csv = await this.analyticsService.getCsvExport(q.from, q.to);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('sales-export.csv');
    return res.send(csv);
  }
}
