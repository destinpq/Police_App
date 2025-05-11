export class UpdateTaskDto {
  id?: number;
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee_id?: number | null;
  deadline?: Date | null;
  completedAt?: Date | null;
  project_id?: number;
  milestone_id?: number | null;
  moneySpent?: number | null;
} 