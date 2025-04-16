import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService, WeeklyActivity, CategoryDistribution, TeamPerformance, MonthlyTrend } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getDashboardMetrics({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('task-completion')
  async getTaskCompletion(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getTaskCompletionMetrics({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('time-metrics')
  async getTimeMetrics(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getTimeMetrics({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('category-distribution')
  async getCategoryDistribution(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<CategoryDistribution[]> {
    return this.analyticsService.getCategoryDistribution({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('weekly-activity')
  async getWeeklyActivity(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<WeeklyActivity[]> {
    return this.analyticsService.getWeeklyActivity({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('efficiency')
  async getEfficiency(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getEfficiencyMetrics({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('overdue')
  async getOverdue(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getOverdueMetrics({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('team-performance')
  async getTeamPerformance(
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<TeamPerformance[]> {
    return this.analyticsService.getTeamPerformance({
      departmentId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }

  @Get('monthly-trends')
  async getMonthlyTrends(
    @Query('userId') userId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<MonthlyTrend[]> {
    return this.analyticsService.getMonthlyTrends({
      userId,
      departmentId,
      projectId,
      dateRange: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined
    });
  }
} 