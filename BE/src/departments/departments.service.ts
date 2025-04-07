import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private usersService: UsersService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      this.logger.log(`Creating new department: ${createDepartmentDto.name}`);
      const department = this.departmentRepository.create(createDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error) {
      this.logger.error(`Failed to create department: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Department[]> {
    try {
      this.logger.log('Retrieving all departments');
      return await this.departmentRepository.find();
    } catch (error) {
      this.logger.error(`Failed to retrieve departments: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Department> {
    try {
      this.logger.log(`Retrieving department with ID: ${id}`);
      const department = await this.departmentRepository.findOne({ where: { id } });
      if (!department) {
        this.logger.warn(`Department with ID "${id}" not found`);
        throw new NotFoundException(`Department with ID "${id}" not found`);
      }
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    try {
      this.logger.log(`Updating department with ID: ${id}`);
      const department = await this.findOne(id);
      this.departmentRepository.merge(department, updateDepartmentDto);
      const updatedDepartment = await this.departmentRepository.save(department);
      
      // Update users if department name has changed
      if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
        await this.usersService.updateUsersByDepartment(id, updateDepartmentDto.name);
      }
      
      return updatedDepartment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Removing department with ID: ${id}`);
      // Find the department first so we know it exists
      const department = await this.findOne(id);
      const result = await this.departmentRepository.delete(id);
      
      if (result.affected === 0) {
        this.logger.warn(`Department with ID "${id}" not found for deletion`);
        throw new NotFoundException(`Department with ID "${id}" not found`);
      }
      
      // Update users after department is deleted
      await this.usersService.updateUsersByDepartment(id, null);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 