import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, ValidateIf } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsEnum(['todo', 'in-progress', 'done'])
  status?: 'todo' | 'in-progress' | 'done';

  @IsOptional()
  @ValidateIf((o) => o.dueDate !== undefined)
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== undefined)
  @IsUUID()
  assigneeId?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.projectId !== undefined)
  @IsUUID()
  projectId?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.tags !== undefined)
  @IsString()
  tags?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.estimatedHours !== undefined)
  @IsString()
  estimatedHours?: string | null;
} 