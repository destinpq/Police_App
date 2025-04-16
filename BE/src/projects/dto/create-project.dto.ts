import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

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

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  tags?: string;
} 