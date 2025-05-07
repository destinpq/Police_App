import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectSeed {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async seed(): Promise<void> {
    const projectCount = await this.projectRepository.count();
    
    if (projectCount === 0) {
      const projects = [
        {
          name: 'Website Redesign',
          description: 'Project for redesigning the company website',
        },
        {
          name: 'Mobile App Development',
          description: 'Development of iOS and Android mobile applications',
        },
        {
          name: 'Marketing Campaign',
          description: 'Q3 marketing campaign for product launch',
        },
        {
          name: 'Internal Tools',
          description: 'Development of internal tools for staff efficiency',
        },
      ];
      
      for (const projectData of projects) {
        const project = this.projectRepository.create(projectData);
        await this.projectRepository.save(project);
      }
      
      console.log('Project seed completed successfully');
    } else {
      console.log('Projects already exist, skipping seed');
    }
  }
} 