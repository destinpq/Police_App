export class CreateTaskDto {
  title: string;
  description: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee_id?: number;
  deadline?: Date;
  project_id: number;
  milestone_id?: number;
  moneySpent?: number;
} 