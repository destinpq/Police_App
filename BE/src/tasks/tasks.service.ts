import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      this.logger.log(`Creating new task: ${createTaskDto.title}`);
      const task = this.taskRepository.create(createTaskDto);
      return await this.taskRepository.save(task);
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      this.logger.log('Retrieving all tasks');
      return await this.taskRepository.find();
    } catch (error) {
      this.logger.error(`Failed to retrieve tasks: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve tasks');
    }
  }

  async findOne(id: string): Promise<Task> {
    try {
      this.logger.log(`Retrieving task with ID: ${id}`);
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) {
        this.logger.warn(`Task with ID "${id}" not found`);
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return task;
    } catch (error) {
      // Don't wrap NotFoundException in InternalServerErrorException
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to retrieve task ${id}`);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      this.logger.log(`Updating task with ID: ${id}`);
      const task = await this.findOne(id);
      this.taskRepository.merge(task, updateTaskDto);
      return await this.taskRepository.save(task);
    } catch (error) {
      // Don't wrap NotFoundException in InternalServerErrorException
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to update task ${id}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Removing task with ID: ${id}`);
      const result = await this.taskRepository.delete(id);
      if (result.affected === 0) {
        this.logger.warn(`Task with ID "${id}" not found for deletion`);
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
    } catch (error) {
      // Don't wrap NotFoundException in InternalServerErrorException
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete task ${id}`);
    }
  }
} 