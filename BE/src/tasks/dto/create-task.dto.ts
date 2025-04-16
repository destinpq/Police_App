import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsEnum(['todo', 'in-progress', 'done'])
  status: 'todo' | 'in-progress' | 'done';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @IsOptional()
  @IsUUID()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  estimatedHours?: string;

  assignee?: never;
  project?: never;
} 