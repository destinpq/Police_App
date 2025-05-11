import { TypeOrmModule } from '@nestjs/typeorm';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionOptions, createConnection, Connection, DeepPartial, DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Import entity classes
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { Task } from './tasks/entities/task.entity';
import { Milestone } from './project/entities/milestone.entity';

// Load environment variables
dotenv.config();

const logger = new Logger('DbSeed');

interface UserData {
  id?: number;
  email: string;
  name: string;
  isAdmin: boolean;
  password?: string;
  created_at?: string;
}

interface ProjectData {
  id?: number;
  name: string;
  description?: string;
  createdById?: number;
  created_at?: string;
}

interface TaskData {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  createdById?: number;
  assignedToId?: number;
  projectId?: number;
  moneySpent?: number;
  created_at?: string;
  updated_at?: string;
}

interface SeedUser {
  email: string;
  password: string;
  isAdmin: boolean;
}

interface SeedProject {
  name: string;
  description: string;
  budget?: number;
  budgetCurrency?: string;
}

interface SeedMilestone {
  name: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: Date;
  projectIndex: number;
}

interface SeedTask {
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assigneeIndex?: number;
  projectIndex: number;
  milestoneIndex?: number;
  deadline?: Date;
  moneySpent?: number;
}

async function bootstrap() {
  logger.log('Starting database seed process...');

  try {
    // Use environment variables for database connection
    const dbConfig = {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false,
      } : false,
      synchronize: false,
      entities: [User, Project, Task, Milestone],
    };

    logger.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port}...`);
    
    // Create connection using the configuration
    const dataSource = new DataSource(dbConfig as any);
    const connection = await dataSource.initialize();
    
    logger.log('Connected to database successfully');
    
    // Check what tables exist
    try {
      const tables = await connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      logger.log('Existing tables:');
      tables.forEach((t: any) => logger.log(`- ${t.table_name}`));
    } catch (e) {
      logger.error('Failed to list tables:', e.message);
    }
    
    // Load seed data from JSON files
    const seedDataPath = path.join(__dirname, '../../');
    
    // Helper to load JSON file with proper error handling
    const loadJsonFile = (filename: string): any => {
      try {
        const filePath = path.join(seedDataPath, filename);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return data;
        }
        
        // Try loading from db_dump.json as a fallback
        const dumpPath = path.join(seedDataPath, 'db_dump.json');
        if (fs.existsSync(dumpPath)) {
          const dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
          
          // Extract the relevant part from the dump
          const key = filename.replace('.json', '').replace('db_', '');
          if (dumpData[key]) {
            return dumpData[key];
          }
        }
        
        logger.warn(`File ${filename} not found, and could not extract from dump file`);
        return [];
      } catch (error) {
        logger.error(`Error loading ${filename}: ${error.message}`);
        return [];
      }
    };
    
    // Load data
    const users = loadJsonFile('db_dump.json')?.users || [];
    const projects = loadJsonFile('db_dump.json')?.projects || [];
    const tasks = loadJsonFile('db_dump.json')?.tasks || [];
    
    logger.log(`Found data: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks`);
    
    // Create tables if they don't exist
    try {
      // Check if user table exists, create if needed
      await connection.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          password VARCHAR(255) NOT NULL,
          "isAdmin" BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Check if project table exists, create if needed
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          "createdById" INTEGER REFERENCES "user"(id),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Check if task table exists, create if needed
      await connection.query(`
        CREATE TABLE IF NOT EXISTS task (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'OPEN',
          priority VARCHAR(50) DEFAULT 'MEDIUM',
          "createdById" INTEGER REFERENCES "user"(id),
          "assignedToId" INTEGER REFERENCES "user"(id),
          "projectId" INTEGER REFERENCES project(id),
          "moneySpent" NUMERIC(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Check if milestone table exists, create if needed
      await connection.query(`
        CREATE TABLE IF NOT EXISTS milestone (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'NOT_STARTED',
          deadline TIMESTAMP,
          "projectId" INTEGER REFERENCES project(id),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      logger.log('Tables created if they did not exist');
    } catch (e) {
      logger.error('Error creating tables:', e.message);
    }
    
    // Seed users
    if (users.length > 0) {
      logger.log(`Seeding ${users.length} users...`);
      
      const userRepository = connection.getRepository(User);
      
      for (const user of users) {
        try {
          // Check if user already exists
          const existingUsers = await connection.query('SELECT * FROM "user" WHERE email = $1', [user.email]);
          const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;
          
          if (existingUser) {
            logger.log(`User ${user.email} already exists, updating...`);
            await connection.query(
              'UPDATE "user" SET name = $1, "isAdmin" = $2 WHERE id = $3',
              [user.name, user.isAdmin, existingUser.id]
            );
          } else {
            logger.log(`Creating new user: ${user.email}`);
            // Set a default password if not provided
            const password = user.password || '$2b$10$1XpzUYsYHkO9iMMBUgGwvONwGrOJk4vr.t1oGh5JMcSPdKM1S9o8S'; // Default password: DestinPQ@24225
            
            await connection.query(
              'INSERT INTO "user" (email, name, password, "isAdmin") VALUES ($1, $2, $3, $4)',
              [user.email, user.name, password, user.isAdmin]
            );
          }
        } catch (e) {
          logger.error(`Error seeding user ${user.email}:`, e.message);
        }
      }
      
      logger.log('User seeding completed');
    } else {
      logger.warn('No user data found to seed');
    }
    
    // Seed projects
    if (projects.length > 0) {
      logger.log(`Seeding ${projects.length} projects...`);
      
      for (const project of projects) {
        try {
          // Check if project already exists
          const existingProjects = await connection.query('SELECT * FROM project WHERE name = $1', [project.name]);
          const existingProject = existingProjects.length > 0 ? existingProjects[0] : null;
          
          // Get the creator user (if createdById is provided)
          let creatorId = null;
          if (project.createdById) {
            const creators = await connection.query('SELECT id FROM "user" WHERE id = $1', [project.createdById]);
            if (creators.length > 0) {
              creatorId = creators[0].id;
            }
          }
          
          if (existingProject) {
            logger.log(`Project ${project.name} already exists, updating...`);
            await connection.query(
              'UPDATE project SET description = $1, "createdById" = $2 WHERE id = $3',
              [project.description, creatorId, existingProject.id]
            );
          } else {
            logger.log(`Creating new project: ${project.name}`);
            await connection.query(
              'INSERT INTO project (name, description, "createdById") VALUES ($1, $2, $3)',
              [project.name, project.description, creatorId]
            );
          }
        } catch (e) {
          logger.error(`Error seeding project ${project.name}:`, e.message);
        }
      }
      
      logger.log('Project seeding completed');
    } else {
      logger.warn('No project data found to seed');
    }
    
    // Seed tasks
    if (tasks.length > 0) {
      logger.log(`Seeding ${tasks.length} tasks...`);
      
      for (const task of tasks) {
        try {
          // Check if task already exists
          const existingTasks = await connection.query('SELECT * FROM task WHERE title = $1', [task.title]);
          const existingTask = existingTasks.length > 0 ? existingTasks[0] : null;
          
          // Get related entity IDs
          let creatorId = null;
          let assigneeId = null;
          let projectId = null;
          
          if (task.createdById) {
            const creators = await connection.query('SELECT id FROM "user" WHERE id = $1', [task.createdById]);
            if (creators.length > 0) {
              creatorId = creators[0].id;
            }
          }
          
          if (task.assignedToId) {
            const assignees = await connection.query('SELECT id FROM "user" WHERE id = $1', [task.assignedToId]);
            if (assignees.length > 0) {
              assigneeId = assignees[0].id;
            }
          }
          
          if (task.projectId) {
            const projects = await connection.query('SELECT id FROM project WHERE id = $1', [task.projectId]);
            if (projects.length > 0) {
              projectId = projects[0].id;
            }
          }
          
          if (existingTask) {
            logger.log(`Task ${task.title} already exists, updating...`);
            await connection.query(
              'UPDATE task SET description = $1, status = $2, priority = $3, "createdById" = $4, "assignedToId" = $5, "projectId" = $6, "moneySpent" = $7 WHERE id = $8',
              [
                task.description, 
                task.status || 'OPEN', 
                task.priority || 'MEDIUM',
                creatorId,
                assigneeId,
                projectId,
                task.moneySpent || 0,
                existingTask.id
              ]
            );
          } else {
            logger.log(`Creating new task: ${task.title}`);
            await connection.query(
              'INSERT INTO task (title, description, status, priority, "createdById", "assignedToId", "projectId", "moneySpent") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
              [
                task.title,
                task.description, 
                task.status || 'OPEN', 
                task.priority || 'MEDIUM',
                creatorId,
                assigneeId,
                projectId,
                task.moneySpent || 0
              ]
            );
          }
        } catch (e) {
          logger.error(`Error seeding task ${task.title}:`, e.message);
        }
      }
      
      logger.log('Task seeding completed');
    } else {
      logger.warn('No task data found to seed');
    }
    
    logger.log('Database seeding completed successfully');
    await connection.destroy();
  } catch (error) {
    logger.error(`Error during database seeding: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

export class DbSeed {
  private readonly users: SeedUser[] = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true,
    },
    {
      email: 'user@example.com',
      password: 'user123',
      isAdmin: false,
    },
  ];

  private readonly projects: SeedProject[] = [
    {
      name: 'Website Redesign',
      description: 'Modernize our company website with new design and features',
      budget: 5000,
      budgetCurrency: 'USD',
    },
    {
      name: 'Mobile App Development',
      description: 'Create a new mobile app for iOS and Android',
      budget: 12000,
      budgetCurrency: 'USD',
    },
    {
      name: 'Marketing Campaign',
      description: 'Run a marketing campaign for Q4',
      budget: 3000,
      budgetCurrency: 'USD',
    },
  ];

  private readonly milestones: SeedMilestone[] = [
    {
      name: 'Design Phase',
      description: 'Complete all design mockups and get approval',
      status: 'COMPLETED',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projectIndex: 0, // Website Redesign
    },
    {
      name: 'Development Phase',
      description: 'Implement the approved designs',
      status: 'IN_PROGRESS',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      projectIndex: 0, // Website Redesign
    },
    {
      name: 'Testing Phase',
      description: 'Test all features and fix bugs',
      status: 'NOT_STARTED',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      projectIndex: 0, // Website Redesign
    },
    {
      name: 'MVP Release',
      description: 'Release the minimum viable product',
      status: 'NOT_STARTED',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      projectIndex: 1, // Mobile App Development
    },
    {
      name: 'Beta Testing',
      description: 'Conduct beta testing with selected users',
      status: 'NOT_STARTED',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      projectIndex: 1, // Mobile App Development
    },
  ];

  private readonly tasks: SeedTask[] = [
    {
      title: 'Create wireframes',
      description: 'Design wireframes for all pages',
      status: 'DONE',
      assigneeIndex: 0,
      projectIndex: 0,
      milestoneIndex: 0,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      moneySpent: 500,
    },
    {
      title: 'Develop homepage',
      description: 'Code the homepage according to the design',
      status: 'IN_PROGRESS',
      assigneeIndex: 1,
      projectIndex: 0,
      milestoneIndex: 1,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      moneySpent: 800,
    },
    {
      title: 'Setup testing environment',
      description: 'Prepare the environment for testing',
      status: 'OPEN',
      projectIndex: 0,
      milestoneIndex: 2,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    },
    {
      title: 'Design app screens',
      description: 'Create design mockups for all app screens',
      status: 'IN_PROGRESS',
      assigneeIndex: 0,
      projectIndex: 1,
      milestoneIndex: 3,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      moneySpent: 1200,
    },
    {
      title: 'Create marketing materials',
      description: 'Design and create marketing materials for the campaign',
      status: 'OPEN',
      projectIndex: 2,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    },
  ];

  constructor(private readonly entityManager: EntityManager) {}

  async seed(): Promise<void> {
    const createdUsers = await this.seedUsers();
    const createdProjects = await this.seedProjects();
    const createdMilestones = await this.seedMilestones(createdProjects);
    await this.seedTasks(createdUsers, createdProjects, createdMilestones);

    console.log('Database seed completed successfully!');
  }

  private async seedUsers(): Promise<User[]> {
    const createdUsers: User[] = [];

    for (const userData of this.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = this.entityManager.create(User, {
        email: userData.email,
        password: hashedPassword,
        isAdmin: userData.isAdmin,
      });

      createdUsers.push(await this.entityManager.save(user));
    }

    console.log(`Seeded ${createdUsers.length} users`);
    return createdUsers;
  }

  private async seedProjects(): Promise<Project[]> {
    const createdProjects: Project[] = [];

    for (const projectData of this.projects) {
      const project = this.entityManager.create(Project, {
        name: projectData.name,
        description: projectData.description,
        budget: projectData.budget,
        budgetSpent: 0,
        budgetCurrency: projectData.budgetCurrency,
      });

      createdProjects.push(await this.entityManager.save(project));
    }

    console.log(`Seeded ${createdProjects.length} projects`);
    return createdProjects;
  }

  private async seedMilestones(projects: Project[]): Promise<Milestone[]> {
    const createdMilestones: Milestone[] = [];

    for (const milestoneData of this.milestones) {
      const project = projects[milestoneData.projectIndex];
      
      if (!project) {
        console.warn(`Project at index ${milestoneData.projectIndex} not found, skipping milestone ${milestoneData.name}`);
        continue;
      }

      const milestone = this.entityManager.create(Milestone, {
        name: milestoneData.name,
        description: milestoneData.description,
        status: milestoneData.status,
        deadline: milestoneData.deadline,
        project_id: project.id,
        project: project,
      });

      createdMilestones.push(await this.entityManager.save(milestone));
    }

    console.log(`Seeded ${createdMilestones.length} milestones`);
    return createdMilestones;
  }

  private async seedTasks(users: User[], projects: Project[], milestones: Milestone[]): Promise<void> {
    const createdTasks: Task[] = [];

    for (const taskData of this.tasks) {
      const project = projects[taskData.projectIndex];
      
      if (!project) {
        console.warn(`Project at index ${taskData.projectIndex} not found, skipping task ${taskData.title}`);
        continue;
      }

      let milestone = null;
      if (taskData.milestoneIndex !== undefined && milestones[taskData.milestoneIndex]) {
        milestone = milestones[taskData.milestoneIndex];
      }

      let assignee = null;
      if (taskData.assigneeIndex !== undefined && users[taskData.assigneeIndex]) {
        assignee = users[taskData.assigneeIndex];
      }

      const task = this.entityManager.create(Task, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assignee: assignee,
        assignee_id: assignee?.id,
        project: project,
        project_id: project.id,
        milestone: milestone,
        milestone_id: milestone?.id,
        deadline: taskData.deadline,
        moneySpent: taskData.moneySpent || 0,
        completedAt: taskData.status === 'DONE' ? new Date() : null,
      });

      createdTasks.push(await this.entityManager.save(task));
    }

    console.log(`Seeded ${createdTasks.length} tasks`);
  }
}

bootstrap(); 