import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class TaskSeed {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async seed(): Promise<void> {
    const taskCount = await this.taskRepository.count();
    
    if (taskCount === 0) {
      // Get admin user
      const admin = await this.userRepository.findOne({ 
        where: { email: 'admin@destinpq.com' },
      });
      
      // Get users
      const users = await this.userRepository.find();
      
      // Get projects
      const projects = await this.projectRepository.find();
      
      if (users.length > 0 && projects.length > 0) {
        const tasks = [
          {
            title: 'Create project plan',
            description: 'Outline the project deliverables and timeline',
            status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
            assignee: admin,
            project: projects[0],
            deadline: new Date('2025-06-01'),
          },
          {
            title: 'Design UI mockups',
            description: 'Create mockups for the new interface',
            status: 'IN_PROGRESS' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
            assignee: users[0],
            project: projects[0],
            deadline: new Date('2025-05-15'),
          },
          {
            title: 'Develop backend API',
            description: 'Implement RESTful API endpoints',
            status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
            assignee: users[1],
            project: projects[1],
            deadline: new Date('2025-05-20'),
          },
          {
            title: 'Write test cases',
            description: 'Create unit and integration tests',
            status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
            assignee: users[2],
            project: projects[1],
            deadline: null,
          },
          {
            title: 'Plan marketing strategy',
            description: 'Develop marketing plan for the product launch',
            status: 'DONE' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
            assignee: users[3],
            project: projects[2],
            deadline: new Date('2025-04-30'),
          },
        ];
        
        for (const taskData of tasks) {
          const task = this.taskRepository.create(taskData);
          await this.taskRepository.save(task);
        }
        
        console.log('Task seed completed successfully');
      } else {
        console.log('Cannot seed tasks - no users or projects found');
      }
    } else {
      console.log('Tasks already exist, skipping seed');
    }
  }
} 