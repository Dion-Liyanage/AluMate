
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardData() {
    const [stats, chartData, activity] = await Promise.all([
      this.analyticsService.getDashboardStats(),
      this.analyticsService.getMonthlyGrowth(),
      this.analyticsService.getRecentActivity(),
    ]);

    return {
      success: true,
      data: {
        stats,
        chartData,
        activity,
      },
    };
  }
}
