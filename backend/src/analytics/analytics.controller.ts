import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { UserStats } from './entities/user-stats.entity';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTO for rating task accuracy
class RateTaskAccuracyDto {
  taskId: number;
  userId: number;
  accuracyScore: number; // 0-100
  qualityRating: number; // 1-5
  feedback?: string;
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAllUsersStats(@Request() req: any): Promise<UserStats[]> {
    const user = req.user as User;
    
    // Only admins can see all users' stats
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can access all users statistics');
    }
    
    return this.analyticsService.getTaskStatistics();
  }

  @Get('user/:id')
  async getUserStats(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<UserStats> {
    const user = req.user as User;
    
    // Non-admins can only see their own stats
    if (!user.isAdmin && user.id !== id) {
      throw new ForbiddenException('You can only access your own statistics');
    }
    
    return this.analyticsService.getUserTaskStatistics(id);
  }

  @Get('current-user')
  async getCurrentUserStats(@Request() req: any): Promise<UserStats> {
    const user = req.user as User;
    return this.analyticsService.getUserTaskStatistics(user.id);
  }

  @Get('projects')
  async getProjectStats(@Request() req: any): Promise<any[]> {
    const user = req.user as User;
    
    // Only admins can see project stats
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can access project statistics');
    }
    
    return this.analyticsService.getProjectStatistics();
  }

  @Post('rate-task')
  async rateTaskAccuracy(
    @Body() rateTaskDto: RateTaskAccuracyDto,
    @Request() req: any
  ): Promise<any> {
    const user = req.user as User;
    
    // Only admins can rate task accuracy
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can rate task accuracy');
    }
    
    // Add admin ID to the DTO
    const ratingData = {
      ...rateTaskDto,
      adminId: user.id
    };
    
    // Call the service method to save the rating
    const result = await this.analyticsService.rateTaskAccuracy(ratingData);
    
    return { 
      success: true, 
      message: 'Task accuracy rated successfully',
      data: result
    };
  }
} 