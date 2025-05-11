import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { User } from '../user/entities/user.entity';
import { ProjectService } from './project.service';

@Injectable()
export class MilestoneService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private projectService: ProjectService,
  ) {}

  async findAll(): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      relations: ['project']
    });
  }

  async findByProject(projectId: number): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { project_id: projectId },
      relations: ['project'],
      order: { deadline: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project', 'tasks'],
    });
    
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }
    
    return milestone;
  }

  async create(createMilestoneDto: CreateMilestoneDto, currentUser: User): Promise<Milestone> {
    // Only admins can create milestones
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can create milestones');
    }
    
    // Verify that the project exists
    await this.projectService.findOne(createMilestoneDto.project_id);
    
    const milestone = this.milestoneRepository.create(createMilestoneDto);
    return this.milestoneRepository.save(milestone);
  }

  async update(id: number, updateMilestoneDto: UpdateMilestoneDto, currentUser: User): Promise<Milestone> {
    // Only admins can update milestones
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can update milestones');
    }
    
    const milestone = await this.findOne(id);
    
    // If project ID is being updated, check that the new project exists
    if (updateMilestoneDto.project_id && updateMilestoneDto.project_id !== milestone.project_id) {
      await this.projectService.findOne(updateMilestoneDto.project_id);
    }
    
    const updatedMilestone = this.milestoneRepository.merge(milestone, updateMilestoneDto);
    return this.milestoneRepository.save(updatedMilestone);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    // Only admins can delete milestones
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can delete milestones');
    }
    
    const result = await this.milestoneRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }
  }
  
  async updateMilestoneStatus(id: number, currentUser: User): Promise<Milestone> {
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can update milestone status');
    }
    
    const milestone = await this.findOne(id);
    const tasksInMilestone = milestone.tasks || [];
    
    // Calculate the new status based on task statuses
    if (tasksInMilestone.length === 0) {
      // If no tasks, keep current status
      return milestone;
    }
    
    const completedTasks = tasksInMilestone.filter(task => task.status === 'DONE').length;
    const totalTasks = tasksInMilestone.length;
    
    let newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    
    if (completedTasks === 0) {
      newStatus = 'NOT_STARTED';
    } else if (completedTasks === totalTasks) {
      newStatus = 'COMPLETED';
    } else {
      newStatus = 'IN_PROGRESS';
    }
    
    if (milestone.status !== newStatus) {
      milestone.status = newStatus;
      return this.milestoneRepository.save(milestone);
    }
    
    return milestone;
  }
} 