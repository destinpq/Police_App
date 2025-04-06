import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsEnum(['planning', 'active', 'on-hold', 'completed'])
  status: 'planning' | 'active' | 'on-hold' | 'completed';

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsString()
  manager: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  tags?: string;
} 