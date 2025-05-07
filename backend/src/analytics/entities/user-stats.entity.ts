export class UserStats {
  userId: number;
  userEmail: string;
  totalTasks: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOpen: number;
  completionRate: number;
  
  // New accuracy metrics (admin-rated)
  accuracyScore: number; // 0-100 score assigned by admin
  qualityRating: number; // 1-5 stars rating
  
  // Time-based metrics
  avgCompletionTime: number; // in hours
  timeEfficiency: number; // percentage (100% means on time, <100% means faster than expected)
  onTimeCompletionRate: number; // percentage of tasks completed on time
} 