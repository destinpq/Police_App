import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { UserStats } from './entities/user-stats.entity';
import { ProjectStats } from './entities/project-stats.entity';
import { AccuracyRating } from './entities/accuracy-rating.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(AccuracyRating)
    private accuracyRepository: Repository<AccuracyRating>,
  ) {}

  /**
   * Get task statistics for all users
   */
  async getTaskStatistics(): Promise<UserStats[]> {
    const users = await this.userRepository.find();
    const stats: UserStats[] = [];
    
    for (const user of users) {
      stats.push(await this.getUserTaskStatistics(user.id));
    }
    
    return stats;
  }

  /**
   * Get task statistics for a specific user
   */
  async getUserTaskStatistics(userId: number): Promise<UserStats> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return {
        userId: 0,
        userEmail: 'Unknown',
        totalTasks: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        tasksOpen: 0,
        completionRate: 0,
        // Default values for new metrics
        accuracyScore: 0,
        qualityRating: 0,
        avgCompletionTime: 0,
        timeEfficiency: 0,
        onTimeCompletionRate: 0
      };
    }
    
    // Get all tasks assigned to this user
    const tasks = await this.taskRepository.find({
      where: { assignee_id: userId },
    });
    
    // Count tasks by status
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'DONE');
    const tasksCompleted = completedTasks.length;
    const tasksInProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const tasksOpen = tasks.filter((task) => task.status === 'OPEN').length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? tasksCompleted / totalTasks : 0;
    
    // Calculate time-based metrics
    const timeMetrics = this.calculateTimeMetrics(completedTasks);
    
    // Calculate accuracy metrics
    const accuracyMetrics = await this.calculateAccuracyMetrics(userId);
    
    return {
      userId,
      userEmail: user.email,
      totalTasks,
      tasksCompleted,
      tasksInProgress,
      tasksOpen,
      completionRate,
      ...timeMetrics,
      ...accuracyMetrics
    };
  }

  /**
   * Calculate time-based metrics for completed tasks
   * Only uses actual task data without mock values
   */
  private calculateTimeMetrics(completedTasks: Task[]) {
    // Skip if no completed tasks
    if (completedTasks.length === 0) {
      return {
        avgCompletionTime: 0,
        timeEfficiency: 0,
        onTimeCompletionRate: 0
      };
    }

    // Calculate average completion time (in hours)
    let totalCompletionTime = 0;
    let tasksWithDeadline = 0;
    let tasksCompletedOnTime = 0;
    
    for (const task of completedTasks) {
      // If both creation and completion times are available
      if (task.createdAt && task.completedAt) {
        const completionTime = task.completedAt.getTime() - task.createdAt.getTime();
        const completionHours = completionTime / (1000 * 60 * 60); // ms to hours
        totalCompletionTime += completionHours;
      }
      
      // Check if task was completed on time (if deadline exists)
      if (task.deadline && task.completedAt) {
        tasksWithDeadline++;
        if (task.completedAt <= task.deadline) {
          tasksCompletedOnTime++;
        }
      }
    }
    
    const avgCompletionTime = totalCompletionTime / completedTasks.length;
    
    // Calculate on-time completion rate
    const onTimeCompletionRate = tasksWithDeadline > 0 
      ? tasksCompletedOnTime / tasksWithDeadline
      : 0; // If no deadlines, return 0% instead of 100%
    
    // For time efficiency, use deadline-based calculation instead of random
    // This is the ratio of actual time vs available time
    let timeEfficiency = 0;
    
    // Only calculate if we have tasks with deadlines
    if (tasksWithDeadline > 0) {
      let totalEfficiency = 0;
      let tasksWithBothTimes = 0;
      
      for (const task of completedTasks) {
        if (task.deadline && task.completedAt && task.createdAt) {
          const availableTime = task.deadline.getTime() - task.createdAt.getTime();
          const usedTime = task.completedAt.getTime() - task.createdAt.getTime();
          
          // Only count valid times (positive available time)
          if (availableTime > 0) {
            // Higher is better - 100% means completed exactly at deadline
            // >100% means completed before deadline, <100% means overdue
            const efficiency = (availableTime / usedTime) * 100;
            totalEfficiency += Math.min(efficiency, 200); // Cap at 200%
            tasksWithBothTimes++;
          }
        }
      }
      
      timeEfficiency = tasksWithBothTimes > 0 ? totalEfficiency / tasksWithBothTimes : 0;
    }
    
    return {
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, // round to 1 decimal
      timeEfficiency: Math.round(timeEfficiency),
      onTimeCompletionRate: Math.round(onTimeCompletionRate * 100) / 100
    };
  }

  /**
   * Calculate accuracy metrics based on admin ratings
   * Uses real data from AccuracyRating repository only
   */
  private async calculateAccuracyMetrics(userId: number) {
    try {
      // Fetch all ratings for this user
      const ratings = await this.accuracyRepository.find({
        where: { userId }
      });
      
      // If no ratings are found, return empty values
      if (!ratings || ratings.length === 0) {
        return {
          accuracyScore: 0,
          qualityRating: 0
        };
      }
      
      // Calculate average scores from real ratings
      const totalAccuracyScore = ratings.reduce((sum, rating) => sum + rating.accuracyScore, 0);
      const totalQualityRating = ratings.reduce((sum, rating) => sum + rating.qualityRating, 0);
      
      return {
        accuracyScore: Math.round(totalAccuracyScore / ratings.length),
        qualityRating: Number((totalQualityRating / ratings.length).toFixed(1))
      };
    } catch (error) {
      console.error('Error calculating accuracy metrics:', error);
      
      // Return empty values on error
      return {
        accuracyScore: 0,
        qualityRating: 0
      };
    }
  }

  /**
   * Get task statistics for all projects
   */
  async getProjectStatistics(): Promise<ProjectStats[]> {
    const projects = await this.projectRepository.find();
    const projectStats: ProjectStats[] = [];
    
    for (const project of projects) {
      // Get all tasks for this project
      const tasks = await this.taskRepository.find({
        where: { project_id: project.id },
      });
      
      // Count tasks by status
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
      const inProgressTasks = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
      const openTasks = tasks.filter((task) => task.status === 'OPEN').length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
      
      projectStats.push({
        projectId: project.id,
        projectName: project.name,
        totalTasks,
        completedTasks,
        inProgressTasks,
        openTasks,
        completionRate,
      });
    }
    
    return projectStats;
  }

  // New method to rate task accuracy
  async rateTaskAccuracy(ratingData: {
    taskId: number;
    userId: number;
    adminId: number;
    accuracyScore: number;
    qualityRating: number;
    feedback?: string;
  }) {
    // Create a new rating entity
    const newRating = this.accuracyRepository.create({
      taskId: ratingData.taskId,
      userId: ratingData.userId,
      adminId: ratingData.adminId,
      accuracyScore: ratingData.accuracyScore,
      qualityRating: ratingData.qualityRating,
      feedback: ratingData.feedback || undefined,
    });
    
    // Save the rating to the database
    return this.accuracyRepository.save(newRating);
  }
} 