import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async create(createProjectDto: CreateProjectDto, currentUser: User): Promise<Project> {
    // Only admins can create projects
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can create projects');
    }
    
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, currentUser: User): Promise<Project> {
    // Only admins can update projects
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can update projects');
    }
    
    const project = await this.findOne(id);
    const updatedProject = this.projectRepository.merge(project, updateProjectDto);
    return this.projectRepository.save(updatedProject);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    // Only admins can delete projects
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Only admins can delete projects');
    }
    
    const result = await this.projectRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
} 