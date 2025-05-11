import { User } from './user';
import { Project } from './project';
import { Milestone } from './milestone';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee?: User;
  assignee_id?: number;
  project: Project;
  project_id: number;
  milestone?: Milestone;
  milestone_id?: number;
  deadline?: string;
  completedAt?: string;
  moneySpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee_id?: number;
  project_id: number;
  milestone_id?: number;
  deadline?: string;
  moneySpent?: number;
}

export interface UpdateTaskDto {
  id?: number;
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee_id?: number;
  project_id?: number;
  milestone_id?: number;
  deadline?: string;
  moneySpent?: number;
} 