import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

// Use PartialType to make all fields optional
// Exclude email as it's usually not updated directly
export class UpdateUserDto extends PartialType(
  CreateUserDto,
) {
  // Optionally override or add specific validation for update
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  // Prevent email update via this DTO if desired
  email?: never; 
} 