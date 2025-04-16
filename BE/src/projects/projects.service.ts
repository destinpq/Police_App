import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectTeamMember } from './entities/project-team-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(ProjectTeamMember)
    private projectTeamMemberRepository: Repository<ProjectTeamMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      this.logger.log(`Creating project: ${createProjectDto.name}`);
      
      const projectData: Partial<Project> = {
        name: createProjectDto.name,
        description: createProjectDto.description,
        startDate: new Date(createProjectDto.startDate),
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
        status: createProjectDto.status,
        priority: createProjectDto.priority,
        managerId: createProjectDto.managerId || undefined,
        departmentId: createProjectDto.departmentId || undefined,
        budget: createProjectDto.budget,
        tags: createProjectDto.tags
      };
      
      const project = this.projectRepository.create(projectData);
      return await this.projectRepository.save(project);
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      this.logger.log(`Updating project with ID: ${id}`);
      const project = await this.findOne(id);
      
      const projectData: Partial<Project> = {};
      
      if (updateProjectDto.name !== undefined) projectData.name = updateProjectDto.name;
      if (updateProjectDto.description !== undefined) projectData.description = updateProjectDto.description;
      if (updateProjectDto.startDate !== undefined) projectData.startDate = new Date(updateProjectDto.startDate);
      if (updateProjectDto.endDate !== undefined) projectData.endDate = updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : null;
      if (updateProjectDto.status !== undefined) projectData.status = updateProjectDto.status;
      if (updateProjectDto.priority !== undefined) projectData.priority = updateProjectDto.priority;
      if (updateProjectDto.managerId !== undefined) projectData.managerId = updateProjectDto.managerId;
      if (updateProjectDto.departmentId !== undefined) projectData.departmentId = updateProjectDto.departmentId;
      if (updateProjectDto.budget !== undefined) projectData.budget = updateProjectDto.budget;
      if (updateProjectDto.tags !== undefined) projectData.tags = updateProjectDto.tags;
      
      this.projectRepository.merge(project, projectData);
      return await this.projectRepository.save(project);
    } catch (error) {
      this.logger.error(`Failed to update project ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    
    await this.taskRepository.update(
      { projectId: id },
      { projectId: null }
    );
  }
  
  async getProjectTaskCount(id: string): Promise<number> {
    const count = await this.taskRepository.count({
      where: { projectId: id }
    });
    return count;
  }
  
  async getProjectWithTaskStats(id: string): Promise<any> {
    const project = await this.findOne(id);
    const tasks = await this.taskRepository.find({
      where: { projectId: id }
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      ...project,
      taskStats: {
        totalTasks,
        completedTasks,
        progress
      }
    };
  }

  /**
   * Add a team member to a project
   */
  async addTeamMember(projectId: string, userId: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if user is already on the team
    const existingMember = await this.projectTeamMemberRepository.findOne({
      where: { projectId, userId }
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this project`);
    }

    // Add user to project team
    const teamMember = this.projectTeamMemberRepository.create({
      projectId,
      userId,
      role: 'Member'  // Default role
    });

    try {
      await this.projectTeamMemberRepository.save(teamMember);
      this.logger.log(`Added user ${userId} to project ${projectId}`);
    } catch (error) {
      this.logger.error(`Failed to add team member: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to add team member to project');
    }
  }

  /**
   * Remove a team member from a project
   */
  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    // Check if the user is on the team
    const teamMember = await this.projectTeamMemberRepository.findOne({
      where: { projectId, userId }
    });

    if (!teamMember) {
      throw new NotFoundException(`User is not a member of this project`);
    }

    // Remove the team member
    try {
      await this.projectTeamMemberRepository.remove(teamMember);
      this.logger.log(`Removed user ${userId} from project ${projectId}`);
    } catch (error) {
      this.logger.error(`Failed to remove team member: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to remove team member from project');
    }
  }

  /**
   * Get all team members for a project
   */
  async getProjectTeam(projectId: string): Promise<User[]> {
    // Check if project exists
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    // Get all team members
    const teamMembers = await this.projectTeamMemberRepository.find({
      where: { projectId },
      relations: ['user']
    });

    // Return the user objects
    return teamMembers.map(member => member.user);
  }
} 