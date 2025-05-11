import { Project } from "./project";
import { Task } from "./task";

export interface Milestone {
  id: number;
  name: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: string;
  project: Project;
  project_id: number;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneDto {
  name: string;
  description: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: string;
  project_id: number;
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: string;
  project_id?: number;
} 