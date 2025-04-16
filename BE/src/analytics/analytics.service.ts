import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, FindOptionsWhere, In } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import * as moment from 'moment';

// Define interfaces for the analytics data
export interface WeeklyActivity {
  day: string;
  tasks: number;
  hours: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  percentage?: string;
}

export interface TeamPerformance {
  name: string;
  tasks: number;
  hours: number;
  efficiency: number;
}

export interface MonthlyTrend {
  month: string;
  tasks: number;
  hours: number;
  efficiency: number;
}

// Common date ranges used in analytics
interface DateRange {
  start: Date;
  end: Date;
}

// Filter parameters interface
export interface AnalyticsFilter {
  userId?: string;
  departmentId?: string;
  projectId?: string;
  dateRange?: DateRange;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  // Get all metrics in one call to reduce API requests
  async getDashboardMetrics(filters: AnalyticsFilter) {
    try {
      // Execute all metrics queries in parallel for better performance
      const [
        taskCompletion,
        timeMetrics,
        categoryDistribution,
        weeklyActivity,
        efficiency,
        overdue
      ] = await Promise.all([
        this.getTaskCompletionMetrics(filters),
        this.getTimeMetrics(filters),
        this.getCategoryDistribution(filters),
        this.getWeeklyActivity(filters),
        this.getEfficiencyMetrics(filters),
        this.getOverdueMetrics(filters)
      ]);

      return {
        taskCompletion,
        timeMetrics,
        categoryDistribution,
        weeklyActivity,
        efficiency,
        overdue
      };
    } catch (error) {
      this.logger.error(`Error fetching dashboard metrics: ${error.message}`, error.stack);
      throw new Error('Failed to retrieve dashboard metrics');
    }
  }

  // Utility function to get date ranges for comparisons
  private getComparisonDateRanges(customRange?: DateRange): { current: DateRange, previous: DateRange } {
    if (customRange) {
      // Calculate a previous period of the same length
      const diff = customRange.end.getTime() - customRange.start.getTime();
      const previousStart = new Date(customRange.start.getTime() - diff);
      const previousEnd = new Date(customRange.start);
      
      return {
        current: customRange,
        previous: { start: previousStart, end: previousEnd }
      };
    }
    
    // Default 30-day range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    
    return {
      current: { start: lastMonth, end: now },
      previous: { start: twoMonthsAgo, end: lastMonth }
    };
  }

  // Helper function to create base query with filters
  private createBaseQuery(filters?: AnalyticsFilter) {
    const query = this.taskRepository.createQueryBuilder('task');
    
    if (filters?.userId) {
      query.andWhere('task.assignee = :userId', { userId: filters.userId });
    }
    
    if (filters?.departmentId) {
      // Join with user to filter by department
      query.innerJoin('users', 'user', 'user.id = task.assignee')
        .andWhere('user.department = :departmentId', { departmentId: filters.departmentId });
    }
    
    if (filters?.projectId) {
      query.andWhere('task.project = :projectId', { projectId: filters.projectId });
    }
    
    if (filters?.dateRange) {
      query.andWhere('task.createdAt BETWEEN :startDate AND :endDate', { 
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      });
    }
    
    return query;
  }

  // Apply filter conditions to a Where clause
  private applyFilters(where: FindOptionsWhere<Task>, filters?: AnalyticsFilter): FindOptionsWhere<Task> {
    const result = { ...where };
    
    if (filters?.userId) {
      result.assigneeId = filters.userId;
    }
    
    if (filters?.projectId) {
      result.projectId = filters.projectId;
    }
    
    if (filters?.dateRange) {
      result.createdAt = Between(filters.dateRange.start, filters.dateRange.end);
    }
    
    // Department filter requires a join and can't be applied with simple where clause
    // It's handled in the query builder methods
    
    return result;
  }

  // Task completion metrics
  async getTaskCompletionMetrics(filters: AnalyticsFilter) {
    try {
      const dateRanges = this.getComparisonDateRanges(filters.dateRange);
      const baseQuery = this.createBaseQuery(filters);
      
      // Current completed tasks
      const currentCompleted = await baseQuery
        .clone()
        .where('task.status = :status', { status: 'done' })
        .andWhere('task.updatedAt >= :lastMonth', { lastMonth: dateRanges.current.start })
        .andWhere('task.updatedAt <= :now', { now: dateRanges.current.end })
        .getCount();

      // Previous month completed tasks
      const previousCompleted = await baseQuery
        .clone()
        .where('task.status = :status', { status: 'done' })
        .andWhere('task.updatedAt >= :twoMonthsAgo', { twoMonthsAgo: dateRanges.previous.start })
        .andWhere('task.updatedAt < :lastMonth', { lastMonth: dateRanges.previous.end })
        .getCount();

      // Calculate percentage change
      let percentChange = 0;
      if (previousCompleted > 0) {
        percentChange = ((currentCompleted - previousCompleted) / previousCompleted) * 100;
      }

      return {
        completed: currentCompleted,
        percentChange: percentChange.toFixed(1),
        previousCompleted, // Add more context for frontend visualization
      };
    } catch (error) {
      this.logger.error(`Error calculating task completion metrics: ${error.message}`, error.stack);
      return { completed: 0, percentChange: '0.0', previousCompleted: 0 };
    }
  }

  // Time metrics - average completion time
  async getTimeMetrics(filters: AnalyticsFilter) {
    try {
      const dateRanges = this.getComparisonDateRanges(filters.dateRange);

      // Current period tasks
      const completedTasks = await this.taskRepository.find({
        where: this.applyFilters({
          status: 'done',
          updatedAt: Between(dateRanges.current.start, dateRanges.current.end),
        }, filters),
      });

      // Calculate average completion time in days
      const { averageDays: currentAverageDays } = this.calculateAverageCompletionDays(completedTasks);
      
      // Previous period tasks
      const previousTasks = await this.taskRepository.find({
        where: this.applyFilters({
          status: 'done',
          updatedAt: Between(dateRanges.previous.start, dateRanges.previous.end),
        }, filters),
      });

      const { averageDays: previousAverageDays } = this.calculateAverageCompletionDays(previousTasks);
      
      const daysChange = currentAverageDays - previousAverageDays;

      return {
        averageDays: currentAverageDays.toFixed(1),
        daysChange: daysChange.toFixed(1),
        tasksAnalyzed: completedTasks.length,
      };
    } catch (error) {
      this.logger.error(`Error calculating time metrics: ${error.message}`, error.stack);
      return { averageDays: '0.0', daysChange: '0.0', tasksAnalyzed: 0 };
    }
  }

  // Helper function to calculate average completion days from a set of tasks
  private calculateAverageCompletionDays(tasks: Task[]) {
    let totalDays = 0;
    let count = 0;

    tasks.forEach(task => {
      if (task.createdAt && task.updatedAt) {
        const createdDate = new Date(task.createdAt);
        const completedDate = new Date(task.updatedAt);
        const days = (completedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        totalDays += days;
        count++;
      }
    });

    const averageDays = count > 0 ? totalDays / count : 0;
    return { averageDays, count };
  }

  // Task distribution by category/tags
  async getCategoryDistribution(filters: AnalyticsFilter): Promise<CategoryDistribution[]> {
    try {
      const tasks = await this.taskRepository.find({
        where: this.applyFilters({}, filters),
      });

      // Group by tags
      const categories: Record<string, number> = {};
      let totalTags = 0;
      
      tasks.forEach(task => {
        if (task.tags) {
          const taskTags = typeof task.tags === 'string' 
            ? task.tags.split(',').map(tag => tag.trim())
            : [task.tags];
            
          taskTags.forEach(tag => {
            if (!tag) return;
            
            const normalizedTag = tag.toLowerCase();
            if (!categories[normalizedTag]) {
              categories[normalizedTag] = 0;
            }
            categories[normalizedTag]++;
            totalTags++;
          });
        }
      });

      // Convert to array format needed for charts with percentage data
      return Object.entries(categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: totalTags > 0 ? (value / totalTags * 100).toFixed(1) : '0.0',
      }));
    } catch (error) {
      this.logger.error(`Error calculating category distribution: ${error.message}`, error.stack);
      return [];
    }
  }

  // Weekly activity
  async getWeeklyActivity(filters: AnalyticsFilter): Promise<WeeklyActivity[]> {
    try {
      const startOfWeek = moment().startOf('week').toDate();
      const results: WeeklyActivity[] = [];
      
      // More efficient approach: fetch all tasks for the week in one query
      const weekStart = moment().startOf('week').toDate();
      const weekEnd = moment().endOf('week').toDate();
      
      const weekTasks = await this.taskRepository.find({
        where: this.applyFilters({
          updatedAt: Between(weekStart, weekEnd),
        }, filters),
      });
      
      // Initialize results array with days of the week
      for (let i = 0; i < 7; i++) {
        const day = moment(startOfWeek).add(i, 'days');
        results.push({
          day: day.format('ddd'), // Mon, Tue, etc.
          tasks: 0,
          hours: 0,
        });
      }
      
      // Process tasks into day buckets
      weekTasks.forEach(task => {
        if (task.updatedAt) {
          const taskDay = moment(task.updatedAt).day();
          // Convert from Sunday=0 to Monday=0 format
          const adjustedDay = taskDay === 0 ? 6 : taskDay - 1;
          
          if (adjustedDay >= 0 && adjustedDay < 7) {
            results[adjustedDay].tasks++;
            
            // Estimate hours based on priority
            const hours = task.priority === 'high' ? 4 :
                         task.priority === 'medium' ? 2 : 1;
            results[adjustedDay].hours += hours;
          }
        }
      });
      
      return results;
    } catch (error) {
      this.logger.error(`Error calculating weekly activity: ${error.message}`, error.stack);
      // Return empty data structure with days of week
      return Array.from({ length: 7 }, (_, i) => ({
        day: moment().startOf('week').add(i, 'days').format('ddd'),
        tasks: 0,
        hours: 0,
      }));
    }
  }

  // Efficiency metrics (calculated based on estimated vs actual time)
  async getEfficiencyMetrics(filters: AnalyticsFilter) {
    try {
      const dateRanges = this.getComparisonDateRanges(filters.dateRange);
      
      // Current period data
      const allTasks = await this.taskRepository.count({
        where: this.applyFilters({}, filters),
      });
      
      const completedTasks = await this.taskRepository.count({
        where: this.applyFilters({ status: 'done' }, filters),
      });

      // Calculate efficiency percentage
      const efficiency = allTasks > 0 ? (completedTasks / allTasks) * 100 : 0;
      
      // Previous period data
      const previousAllTasks = await this.taskRepository.count({
        where: this.applyFilters({
          createdAt: Between(dateRanges.previous.start, dateRanges.previous.end),
        }, filters),
      });
      
      const previousCompletedTasks = await this.taskRepository.count({
        where: this.applyFilters({
          status: 'done',
          updatedAt: Between(dateRanges.previous.start, dateRanges.previous.end),
        }, filters),
      });
      
      const previousEfficiency = previousAllTasks > 0 ? (previousCompletedTasks / previousAllTasks) * 100 : 0;
      const efficiencyChange = efficiency - previousEfficiency;
      
      return {
        efficiency: Math.round(efficiency),
        efficiencyChange: efficiencyChange.toFixed(1),
        totalTasks: allTasks,
        completedTasks,
      };
    } catch (error) {
      this.logger.error(`Error calculating efficiency metrics: ${error.message}`, error.stack);
      return { efficiency: 0, efficiencyChange: '0.0', totalTasks: 0, completedTasks: 0 };
    }
  }

  // Overdue metrics
  async getOverdueMetrics(filters: AnalyticsFilter) {
    try {
      const now = new Date();
      const dateRanges = this.getComparisonDateRanges(filters.dateRange);
      
      // Current period data
      const allTasks = await this.taskRepository.count({
        where: this.applyFilters({}, filters),
      });
      
      const overdueTasks = await this.taskRepository.count({
        where: this.applyFilters({
          dueDate: Between(new Date(2000, 0, 1), now),
          status: Not('done'),
        }, filters),
      });
      
      // Calculate overdue percentage
      const overdueRate = allTasks > 0 ? (overdueTasks / allTasks) * 100 : 0;
      
      // Previous period data
      const previousTasks = await this.taskRepository.count({
        where: this.applyFilters({
          createdAt: Between(dateRanges.previous.start, dateRanges.previous.end),
        }, filters),
      });
      
      const previousOverdueTasks = await this.taskRepository.count({
        where: this.applyFilters({
          dueDate: Between(new Date(2000, 0, 1), dateRanges.previous.end),
          status: Not('done'),
          createdAt: Between(dateRanges.previous.start, dateRanges.previous.end),
        }, filters),
      });
      
      const previousOverdueRate = previousTasks > 0 ? (previousOverdueTasks / previousTasks) * 100 : 0;
      const overdueChange = overdueRate - previousOverdueRate;
      
      return {
        overdueRate: Math.round(overdueRate),
        overdueChange: overdueChange.toFixed(1),
        overdueTasks,
        totalTasks: allTasks,
      };
    } catch (error) {
      this.logger.error(`Error calculating overdue metrics: ${error.message}`, error.stack);
      return { overdueRate: 0, overdueChange: '0.0', overdueTasks: 0, totalTasks: 0 };
    }
  }

  // Get team members performance - optimized to reduce database calls
  async getTeamPerformance(filters?: Omit<AnalyticsFilter, 'userId'>): Promise<TeamPerformance[]> {
    try {
      let userQuery = this.userRepository.createQueryBuilder('user');
      
      if (filters?.departmentId) {
        userQuery = userQuery.where('user.department = :departmentId', { 
          departmentId: filters.departmentId 
        });
      }
      
      const users = await userQuery.getMany();
      
      if (users.length === 0) {
        return [];
      }
      
      // Build a query based on filters
      let taskQuery = this.taskRepository.createQueryBuilder('task')
        .where('task.assignee IN (:...userIds)', { 
          userIds: users.map(user => user.id) 
        });
        
      if (filters?.dateRange) {
        taskQuery = taskQuery.andWhere('task.createdAt BETWEEN :start AND :end', {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        });
      }
      
      if (filters?.projectId) {
        taskQuery = taskQuery.andWhere('task.project = :projectId', {
          projectId: filters.projectId
        });
      }
      
      const allTasks = await taskQuery.getMany();
      
      // Process the tasks by user
      const userTaskMap: Record<string, { total: number, completed: number }> = {};
      
      // Initialize map for all users
      users.forEach(user => {
        userTaskMap[user.id] = { total: 0, completed: 0 };
      });
      
      // Count tasks per user
      allTasks.forEach(task => {
        if (task.assignee && task.assigneeId && userTaskMap[task.assigneeId]) {
          userTaskMap[task.assigneeId].total++;
          if (task.status === 'done') {
            userTaskMap[task.assigneeId].completed++;
          }
        }
      });
      
      // Convert to the required output format
      const results: TeamPerformance[] = users.map(user => {
        const userStats = userTaskMap[user.id] || { total: 0, completed: 0 };
        const efficiency = userStats.total > 0 
          ? (userStats.completed / userStats.total) * 100 
          : 0;
        
        return {
          name: user.name,
          tasks: userStats.completed,
          hours: userStats.completed * 2, // Estimate 2 hours per task
          efficiency: Math.round(efficiency),
        };
      });
      
      // Sort by tasks completed
      return results.sort((a, b) => b.tasks - a.tasks);
    } catch (error) {
      this.logger.error(`Error calculating team performance: ${error.message}`, error.stack);
      return [];
    }
  }

  // Get monthly trends - optimized to reduce database calls
  async getMonthlyTrends(filters?: AnalyticsFilter): Promise<MonthlyTrend[]> {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      
      // Build task query with filters
      let taskQuery = this.createBaseQuery(filters)
        .andWhere('task.createdAt >= :sixMonthsAgo', { sixMonthsAgo });
        
      const allTasks = await taskQuery.getMany();
      
      const results: MonthlyTrend[] = [];
      
      // Initialize data structure for each month
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        // Filter tasks for this month
        const monthTasks = allTasks.filter(task => {
          const taskDate = task.createdAt ? new Date(task.createdAt) : null;
          return taskDate && taskDate >= monthStart && taskDate <= monthEnd;
        });
        
        const completedMonthTasks = monthTasks.filter(task => task.status === 'done');
        
        const efficiency = monthTasks.length > 0 
          ? (completedMonthTasks.length / monthTasks.length) * 100 
          : 0;
        
        results.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          tasks: completedMonthTasks.length,
          hours: completedMonthTasks.length * 2, // Estimate based on tasks
          efficiency: Math.round(efficiency),
        });
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error calculating monthly trends: ${error.message}`, error.stack);
      return [];
    }
  }
} 