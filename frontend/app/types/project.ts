export interface Project {
  id: number;
  name: string;
  description: string;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  budget?: number;
  budgetSpent?: number;
  budgetCurrency?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  budget?: number | null;
  budgetSpent?: number | null;
  budgetCurrency?: string | null;
} 