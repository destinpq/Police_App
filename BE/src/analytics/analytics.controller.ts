import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService, WeeklyActivity, CategoryDistribution, TeamPerformance, MonthlyTrend } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@Query('userId') userId?: string) {
    return this.analyticsService.getDashboardMetrics(userId);
  }

  @Get('task-completion')
  async getTaskCompletion(@Query('userId') userId?: string) {
    return this.analyticsService.getTaskCompletionMetrics(userId);
  }

  @Get('time-metrics')
  async getTimeMetrics(@Query('userId') userId?: string) {
    return this.analyticsService.getTimeMetrics(userId);
  }

  @Get('category-distribution')
  async getCategoryDistribution(@Query('userId') userId?: string): Promise<CategoryDistribution[]> {
    return this.analyticsService.getCategoryDistribution(userId);
  }

  @Get('weekly-activity')
  async getWeeklyActivity(@Query('userId') userId?: string): Promise<WeeklyActivity[]> {
    return this.analyticsService.getWeeklyActivity(userId);
  }

  @Get('efficiency')
  async getEfficiency(@Query('userId') userId?: string) {
    return this.analyticsService.getEfficiencyMetrics(userId);
  }

  @Get('overdue')
  async getOverdue(@Query('userId') userId?: string) {
    return this.analyticsService.getOverdueMetrics(userId);
  }

  @Get('team-performance')
  async getTeamPerformance(): Promise<TeamPerformance[]> {
    return this.analyticsService.getTeamPerformance();
  }

  @Get('monthly-trends')
  async getMonthlyTrends(@Query('userId') userId?: string): Promise<MonthlyTrend[]> {
    return this.analyticsService.getMonthlyTrends(userId);
  }
} 