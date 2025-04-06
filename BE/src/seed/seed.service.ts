import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    try {
      await this.seedUsers();
      await this.seedProjects();
      await this.seedTasks();
      
      this.logger.log('Seeding completed successfully');
      return { message: 'Database seeded successfully' };
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`);
      throw error;
    }
  }

  async truncate() {
    try {
      // Get all table names from our entities
      const entities = this.dataSource.entityMetadatas;
      
      // For PostgreSQL, we need to disable triggers temporarily
      await this.dataSource.query('SET session_replication_role = replica;');
      
      // Truncate each table
      for (const entity of entities) {
        // TRUNCATE is faster than clear() and resets sequences
        await this.dataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
        this.logger.log(`Truncated table: ${entity.tableName}`);
      }
      
      // Re-enable triggers
      await this.dataSource.query('SET session_replication_role = DEFAULT;');
      
      this.logger.log('All tables truncated successfully');
      return { message: 'Database truncated successfully' };
    } catch (error) {
      this.logger.error(`Truncation failed: ${error.message}`);
      throw error;
    }
  }

  private async seedUsers() {
    const usersCount = await this.userRepository.count();
    
    if (usersCount === 0) {
      // Create admin user
      await this.usersService.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
      });
      
      // Create normal user
      await this.usersService.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'User123!',
      });
      
      // Create team members
      const teamMembers = [
        { name: 'Alice Johnson', email: 'alice@example.com', password: 'Password123!' },
        { name: 'Bob Smith', email: 'bob@example.com', password: 'Password123!' },
        { name: 'Charlie Davis', email: 'charlie@example.com', password: 'Password123!' },
        { name: 'Diana Miller', email: 'diana@example.com', password: 'Password123!' },
      ];
      
      for (const member of teamMembers) {
        await this.usersService.create(member);
      }
      
      this.logger.log('Users seeded successfully');
    } else {
      this.logger.log('Users table already has data, skipping seeding');
    }
  }
  
  private async seedProjects() {
    const projectsCount = await this.projectRepository.count();
    
    if (projectsCount === 0) {
      const projects = [
        {
          name: 'Website Redesign',
          description: 'Complete overhaul of the company website with modern design and improved user experience',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          status: 'active' as 'planning' | 'active' | 'on-hold' | 'completed',
          priority: 'high' as 'low' | 'medium' | 'high',
          manager: 'manager1',
          department: 'design',
          budget: '50000',
          tags: 'website,design,frontend',
        },
        {
          name: 'Mobile App Development',
          description: 'Develop a native mobile application for iOS and Android platforms',
          startDate: new Date(),
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
          status: 'planning' as 'planning' | 'active' | 'on-hold' | 'completed',
          priority: 'high' as 'low' | 'medium' | 'high',
          manager: 'manager2',
          department: 'engineering',
          budget: '75000',
          tags: 'mobile,app,development',
        },
        {
          name: 'Marketing Campaign',
          description: 'Launch a comprehensive marketing campaign for the new product line',
          startDate: new Date(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          status: 'active' as 'planning' | 'active' | 'on-hold' | 'completed',
          priority: 'medium' as 'low' | 'medium' | 'high',
          manager: 'manager3',
          department: 'marketing',
          budget: '25000',
          tags: 'marketing,social media,advertising',
        },
        {
          name: 'Product Launch',
          description: 'Coordinate the launch of our new flagship product',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          status: 'planning' as 'planning' | 'active' | 'on-hold' | 'completed',
          priority: 'high' as 'low' | 'medium' | 'high',
          manager: 'manager4',
          department: 'product',
          budget: '100000',
          tags: 'product,launch,event',
        },
      ];
      
      for (const project of projects) {
        await this.projectsService.create(project);
      }
      
      this.logger.log('Projects seeded successfully');
    } else {
      this.logger.log('Projects table already has data, skipping seeding');
    }
  }
  
  private async seedTasks() {
    const tasksCount = await this.taskRepository.count();
    
    if (tasksCount === 0) {
      const tasks = [
        {
          title: 'Research competitors',
          description: 'Analyze top 5 competitors in the market',
          status: 'todo' as 'todo' | 'in-progress' | 'done',
          priority: 'medium' as 'low' | 'medium' | 'high',
          assignee: 'user1',
          project: 'project3', // Marketing Campaign
          tags: 'research,marketing',
          estimatedHours: '8',
        },
        {
          title: 'Design new landing page',
          description: 'Create wireframes for the new landing page',
          status: 'todo' as 'todo' | 'in-progress' | 'done',
          priority: 'high' as 'low' | 'medium' | 'high',
          assignee: 'user2',
          project: 'project1', // Website Redesign
          tags: 'design,frontend',
          estimatedHours: '12',
        },
        {
          title: 'Update documentation',
          description: 'Update API documentation with new endpoints',
          status: 'in-progress' as 'todo' | 'in-progress' | 'done',
          priority: 'medium' as 'low' | 'medium' | 'high',
          assignee: 'user3',
          project: 'project2', // Mobile App
          tags: 'documentation,api',
          estimatedHours: '6',
        },
        {
          title: 'Fix navigation bug',
          description: 'Fix the navigation bug on mobile devices',
          status: 'in-progress' as 'todo' | 'in-progress' | 'done',
          priority: 'high' as 'low' | 'medium' | 'high',
          assignee: 'user4',
          project: 'project1', // Website Redesign
          tags: 'bug,frontend',
          estimatedHours: '4',
        },
        {
          title: 'Write blog post',
          description: 'Write a blog post about our new features',
          status: 'in-progress' as 'todo' | 'in-progress' | 'done',
          priority: 'low' as 'low' | 'medium' | 'high',
          assignee: 'user1',
          project: 'project3', // Marketing Campaign
          tags: 'content,marketing',
          estimatedHours: '5',
        },
        {
          title: 'Implement authentication',
          description: 'Implement OAuth authentication',
          status: 'done' as 'todo' | 'in-progress' | 'done',
          priority: 'high' as 'low' | 'medium' | 'high',
          assignee: 'user2',
          project: 'project2', // Mobile App
          tags: 'security,backend',
          estimatedHours: '10',
        },
        {
          title: 'Create email templates',
          description: 'Design and code email templates for marketing',
          status: 'done' as 'todo' | 'in-progress' | 'done',
          priority: 'medium' as 'low' | 'medium' | 'high',
          assignee: 'user3',
          project: 'project3', // Marketing Campaign
          tags: 'email,design',
          estimatedHours: '7',
        },
        {
          title: 'Optimize database queries',
          description: 'Improve performance of slow database queries',
          status: 'done' as 'todo' | 'in-progress' | 'done',
          priority: 'high' as 'low' | 'medium' | 'high',
          assignee: 'user4',
          project: 'project2', // Mobile App
          tags: 'performance,database',
          estimatedHours: '9',
        },
      ];
      
      for (const task of tasks) {
        // Set a random due date (between now and 30 days from now)
        const daysToAdd = Math.floor(Math.random() * 30) + 1;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToAdd);
        
        await this.tasksService.create({
          ...task,
          dueDate,
        });
      }
      
      this.logger.log('Tasks seeded successfully');
    } else {
      this.logger.log('Tasks table already has data, skipping seeding');
    }
  }
} 