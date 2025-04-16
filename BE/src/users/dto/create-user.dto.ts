import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
  
  @IsOptional()
  @IsUUID()
  roleId?: string | null;
  
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;
  
  @IsOptional()
  @IsString()
  bio?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  skills?: string;
  
  @IsOptional()
  @IsString()
  avatar?: string;

  role?: never;
  department?: never;
} 