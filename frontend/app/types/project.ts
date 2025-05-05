export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED'
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  completionPercentage?: number;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  completionPercentage?: number;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  completionPercentage?: number;
  budget?: number | null;
  budgetSpent?: number | null;
  budgetCurrency?: string | null;
} 