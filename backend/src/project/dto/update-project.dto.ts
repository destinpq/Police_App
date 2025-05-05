import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  completionPercentage?: number;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
} 