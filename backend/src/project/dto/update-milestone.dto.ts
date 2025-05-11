import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

  @IsOptional()
  @IsNumber()
  project_id?: number;
} 