export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
} 