import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private notificationService: NotificationService,
  ) {}

  async findAll(currentUser?: User): Promise<Task[]> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    // Admin can see all tasks, regular users only see their tasks
    if (currentUser.isAdmin) {
      return this.tasksRepository.find({
        relations: ['assignee', 'project'],
      });
    } else {
      return this.tasksRepository.find({
        where: { assignee_id: currentUser.id },
        relations: ['assignee', 'project'],
      });
    }
  }

  async findOne(id: number, currentUser?: User): Promise<Task> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee', 'project'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    // Check if user is authorized to view this task
    if (!currentUser.isAdmin && task.assignee_id !== currentUser.id) {
      throw new ForbiddenException('You are not authorized to access this task');
    }
    
    return task;
  }

  async create(createTaskDto: CreateTaskDto, currentUser?: User): Promise<Task> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can create tasks with assignees
    if (!currentUser.isAdmin && createTaskDto.assignee_id) {
      throw new ForbiddenException('Only admins can assign tasks to users');
    }
    
    // Validate project exists
    const project = await this.projectRepository.findOne({
      where: { id: createTaskDto.project_id },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${createTaskDto.project_id} not found`);
    }
    
    const task = this.tasksRepository.create({
      ...createTaskDto,
      status: createTaskDto.status || 'OPEN',
    });
    
    // Non-admins can only create tasks for themselves
    if (!currentUser.isAdmin) {
      task.assignee_id = currentUser.id;
    }
    
    if (createTaskDto.assignee_id) {
      const user = await this.userRepository.findOne({
        where: { id: createTaskDto.assignee_id },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${createTaskDto.assignee_id} not found`);
      }
      
      task.assignee = user;
      task.assignee_id = user.id;
      
      // Save task first to get the ID
      const savedTask = await this.tasksRepository.save(task);
      
      // Send notification email
      await this.notificationService.sendTaskAssignmentNotification(user, savedTask);
      
      return savedTask;
    } else {
      task.assignee = null;
      task.assignee_id = null;
      return this.tasksRepository.save(task);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, currentUser?: User): Promise<Task> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    const task = await this.findOne(id, currentUser);
    
    // Only admins can reassign tasks
    if (!currentUser.isAdmin && updateTaskDto.assignee_id !== undefined && updateTaskDto.assignee_id !== task.assignee_id) {
      throw new ForbiddenException('Only admins can reassign tasks');
    }
    
    // Check if project is being changed and validate it exists
    if (updateTaskDto.project_id !== undefined) {
      // Only admins can change project
      if (!currentUser.isAdmin) {
        throw new ForbiddenException('Only admins can change the project of a task');
      }
      
      const project = await this.projectRepository.findOne({
        where: { id: updateTaskDto.project_id },
      });
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${updateTaskDto.project_id} not found`);
      }
    }
    
    // Check if status is being updated to DONE and set completedAt
    if (updateTaskDto.status === 'DONE' && task.status !== 'DONE') {
      updateTaskDto.completedAt = new Date();
    }
    
    // Check if assignee is being changed
    let shouldNotify = false;
    let newAssignee: User | null = null;
    
    if (updateTaskDto.assignee_id !== undefined) {
      if (updateTaskDto.assignee_id) {
        const user = await this.userRepository.findOne({
          where: { id: updateTaskDto.assignee_id },
        });
        
        if (!user) {
          throw new NotFoundException(`User with ID ${updateTaskDto.assignee_id} not found`);
        }
        
        // Check if the assignee is different from the current one
        const isNewAssignment = task.assignee_id !== user.id;
        shouldNotify = isNewAssignment;
        newAssignee = user;
        
        task.assignee = user;
        task.assignee_id = user.id;
      } else {
        task.assignee = null;
        task.assignee_id = null;
      }
    }
    
    // Remove assignee_id from updateTaskDto to avoid conflicts
    const { assignee_id, ...taskDataToUpdate } = updateTaskDto;
    
    const updatedTask = this.tasksRepository.merge(task, taskDataToUpdate);
    const savedTask = await this.tasksRepository.save(updatedTask);
    
    // Send notification if there is a new assignee
    if (shouldNotify && newAssignee) {
      await this.notificationService.sendTaskAssignmentNotification(newAssignee, savedTask);
    }
    
    return savedTask;
  }

  async remove(id: number, currentUser?: User): Promise<void> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can delete tasks
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can delete tasks');
    }
    
    const result = await this.tasksRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async findByStatus(status: 'OPEN' | 'IN_PROGRESS' | 'DONE', currentUser?: User): Promise<Task[]> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    if (currentUser.isAdmin) {
      return this.tasksRepository.find({
        where: { status },
        relations: ['assignee', 'project'],
      });
    } else {
      return this.tasksRepository.find({
        where: { status, assignee_id: currentUser.id },
        relations: ['assignee', 'project'],
      });
    }
  }

  async findByAssignee(userId: number, currentUser?: User): Promise<Task[]> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins or the user themselves can view their tasks
    if (!currentUser.isAdmin && currentUser.id !== userId) {
      throw new ForbiddenException('You are not authorized to view these tasks');
    }
    
    return this.tasksRepository.find({
      where: { assignee_id: userId },
      relations: ['assignee', 'project'],
    });
  }
  
  async findByProject(projectId: number, currentUser?: User): Promise<Task[]> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    
    if (currentUser.isAdmin) {
      return this.tasksRepository.find({
        where: { project_id: projectId },
        relations: ['assignee', 'project'],
      });
    } else {
      return this.tasksRepository.find({
        where: { project_id: projectId, assignee_id: currentUser.id },
        relations: ['assignee', 'project'],
      });
    }
  }
  
  async findOverdueTasks(currentUser?: User): Promise<Task[]> {
    // Ensure user is authenticated
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    const now = new Date();
    
    if (currentUser.isAdmin) {
      return this.tasksRepository.find({
        where: {
          status: 'OPEN',
          deadline: LessThan(now)
        },
        relations: ['assignee', 'project'],
      });
    } else {
      return this.tasksRepository.find({
        where: {
          status: 'OPEN',
          deadline: LessThan(now),
          assignee_id: currentUser.id
        },
        relations: ['assignee', 'project'],
      });
    }
  }
}
