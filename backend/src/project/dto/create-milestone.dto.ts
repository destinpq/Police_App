import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

  @IsNotEmpty()
  @IsNumber()
  project_id: number;
} 