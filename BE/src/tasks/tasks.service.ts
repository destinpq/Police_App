import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

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
      
      // Create task entity with provided fields
      const task = this.taskRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        assigneeId: createTaskDto.assigneeId,
        projectId: createTaskDto.projectId,
        tags: createTaskDto.tags,
        estimatedHours: createTaskDto.estimatedHours,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      });
      
      // Save the task
      const savedTask = await this.taskRepository.save(task);
      this.logger.log(`Task created with ID: ${savedTask.id}`);
      
      // Return the saved task
      return savedTask;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findAll(): Promise<Task[]> {
    this.logger.log('Attempting to find all tasks');
    try {
      // Use a more detailed query to ensure we get all tasks with their relations
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .leftJoinAndSelect('task.project', 'project')
        .select([
          'task.id', 'task.title', 'task.description', 'task.status', 
          'task.priority', 'task.dueDate', 'task.estimatedHours', 
          'task.tags', 'task.projectId', 'task.assigneeId',
          'task.createdAt', 'task.updatedAt',
          'assignee.id', 'assignee.name', 'assignee.email',
          'project.id', 'project.name', 'project.description'
        ])
        .orderBy('task.updatedAt', 'DESC') // Get newest tasks first
        .getMany();
      
      this.logger.log(`Successfully found ${tasks.length} tasks.`);
      
      // Log the first task if available for debugging
      if (tasks.length > 0) {
        this.logger.debug(`First task: ${JSON.stringify(tasks[0])}`);
      }
      
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to find tasks: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `An error occurred while fetching tasks: ${error.message}`,
      );
    }
  }

  async findByProject(projectId: string): Promise<Task[]> {
    try {
      this.logger.log(`Retrieving tasks for project ID: ${projectId}`);
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .select([
          'task.id', 'task.title', 'task.description', 'task.status', 
          'task.priority', 'task.dueDate', 'task.estimatedHours', 
          'task.tags', 'task.projectId', 'task.assigneeId',
          'task.createdAt', 'task.updatedAt',
          'assignee.id', 'assignee.name', 'assignee.email'
        ])
        .where('task.projectId = :projectId', { projectId })
        .getMany();
        
      return tasks;
    } catch (error) {
      this.logger.error(`Failed to retrieve tasks for project ${projectId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to retrieve tasks for project ${projectId}`);
    }
  }

  async findOne(id: string): Promise<Task> {
    try {
      this.logger.log(`Retrieving task with ID: ${id}`);
      const task = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .select([
          'task.id', 'task.title', 'task.description', 'task.status', 
          'task.priority', 'task.dueDate', 'task.estimatedHours', 
          'task.tags', 'task.projectId', 'task.assigneeId',
          'task.createdAt', 'task.updatedAt',
          'assignee.id', 'assignee.name', 'assignee.email'
        ])
        .where('task.id = :id', { id })
        .getOne();
        
      if (!task) {
        this.logger.warn(`Task with ID "${id}" not found`);
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to retrieve task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to retrieve task ${id}`);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      this.logger.log(`Updating task with ID: ${id}`);
      
      // First, check if the task exists
      const task = await this.findOne(id);
      
      // Create update object with provided fields
      const updateData: Partial<Task> = {};
      
      if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
      if (updateTaskDto.status !== undefined) updateData.status = updateTaskDto.status;
      if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
      if (updateTaskDto.assigneeId !== undefined) updateData.assigneeId = updateTaskDto.assigneeId;
      if (updateTaskDto.projectId !== undefined) updateData.projectId = updateTaskDto.projectId;
      if (updateTaskDto.tags !== undefined) updateData.tags = updateTaskDto.tags;
      if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
      if (updateTaskDto.dueDate !== undefined) {
        updateData.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
      }
      
      // Update the task
      await this.taskRepository.update(id, updateData);
      
      // Get and return the updated task
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete task ${id}`);
    }
  }
} 