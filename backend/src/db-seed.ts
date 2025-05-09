import { TypeOrmModule } from '@nestjs/typeorm';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionOptions, createConnection, Connection, DeepPartial } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Import entity classes
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { Task } from './tasks/entities/task.entity';

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

async function bootstrap() {
  logger.log('Starting database seed process...');

  try {
    // Get connection options from ormconfig
    const connectionOptions = await getConnectionOptions();
    
    // Create connection
    const connection = await createConnection({
      ...connectionOptions,
      entities: [User, Project, Task],
    });
    
    logger.log('Connected to database');
    
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
    
    // Seed users
    if (users.length > 0) {
      logger.log(`Seeding ${users.length} users...`);
      
      const userRepository = connection.getRepository(User);
      const existingUsers = await userRepository.find();
      
      // For each user in seed data
      for (const user of users) {
        // Check if user already exists
        const existingUser = existingUsers.find(u => u.email === user.email);
        
        if (existingUser) {
          logger.log(`User ${user.email} already exists, updating...`);
          await userRepository.update(existingUser.id, {
            email: user.email,
            isAdmin: user.isAdmin,
            // name field might not exist in the entity, so we need to check entity definition
          });
        } else {
          logger.log(`Creating new user: ${user.email}`);
          // Set a default password if not provided
          const userData: DeepPartial<User> = {
            email: user.email,
            isAdmin: user.isAdmin,
            password: user.password || '$2b$10$1XpzUYsYHkO9iMMBUgGwvONwGrOJk4vr.t1oGh5JMcSPdKM1S9o8S', // Default password: DestinPQ@24225
          };
          // Add name if it's part of the entity
          if ('name' in user) {
            userData['name' as keyof User] = user.name as any;
          }
          const newUser = userRepository.create(userData);
          await userRepository.save(newUser);
        }
      }
      
      logger.log('User seeding completed');
    } else {
      logger.warn('No user data found to seed');
    }
    
    // Seed projects
    if (projects.length > 0) {
      logger.log(`Seeding ${projects.length} projects...`);
      
      const projectRepository = connection.getRepository(Project);
      const userRepository = connection.getRepository(User);
      
      for (const project of projects) {
        const existingProject = await projectRepository.findOne({ where: { name: project.name } });
        
        // Get the creator user (if createdById is provided)
        let creator: User | undefined = undefined;
        if (project.createdById) {
          creator = await userRepository.findOne({ where: { id: project.createdById } });
        }
        
        if (existingProject) {
          logger.log(`Project ${project.name} already exists, updating...`);
          const updateData: DeepPartial<Project> = {
            description: project.description,
          };
          if (creator) {
            updateData['createdBy' as keyof Project] = creator as any;
          }
          await projectRepository.update(existingProject.id, updateData);
        } else {
          logger.log(`Creating new project: ${project.name}`);
          const projectData: DeepPartial<Project> = {
            name: project.name,
            description: project.description,
          };
          if (creator) {
            projectData['createdBy' as keyof Project] = creator as any;
          }
          const newProject = projectRepository.create(projectData);
          await projectRepository.save(newProject);
        }
      }
      
      logger.log('Project seeding completed');
    } else {
      logger.warn('No project data found to seed');
    }
    
    // Seed tasks
    if (tasks.length > 0) {
      logger.log(`Seeding ${tasks.length} tasks...`);
      
      const taskRepository = connection.getRepository(Task);
      const userRepository = connection.getRepository(User);
      const projectRepository = connection.getRepository(Project);
      
      for (const task of tasks) {
        const existingTask = await taskRepository.findOne({ where: { title: task.title } });
        
        // Get related entities
        let creator: User | undefined = undefined;
        let assignee: User | undefined = undefined;
        let project: Project | undefined = undefined;
        
        if (task.createdById) {
          creator = await userRepository.findOne({ where: { id: task.createdById } });
        }
        
        if (task.assignedToId) {
          assignee = await userRepository.findOne({ where: { id: task.assignedToId } });
        }
        
        if (task.projectId) {
          project = await projectRepository.findOne({ where: { id: task.projectId } });
        }
        
        if (existingTask) {
          logger.log(`Task ${task.title} already exists, updating...`);
          const updateData: DeepPartial<Task> = {
            description: task.description,
            status: task.status,
            priority: task.priority,
            moneySpent: task.moneySpent || 0,
          };
          if (creator) updateData['createdBy' as keyof Task] = creator as any;
          if (assignee) updateData['assignee' as keyof Task] = assignee as any;
          if (project) updateData['project' as keyof Task] = project as any;
          
          await taskRepository.update(existingTask.id, updateData);
        } else {
          logger.log(`Creating new task: ${task.title}`);
          const taskData: DeepPartial<Task> = {
            title: task.title,
            description: task.description,
            status: task.status || 'OPEN',
            priority: task.priority || 'MEDIUM',
            moneySpent: task.moneySpent || 0,
          };
          if (creator) taskData['createdBy' as keyof Task] = creator as any;
          if (assignee) taskData['assignee' as keyof Task] = assignee as any;
          if (project) taskData['project' as keyof Task] = project as any;
          
          const newTask = taskRepository.create(taskData);
          await taskRepository.save(newTask);
        }
      }
      
      logger.log('Task seeding completed');
    } else {
      logger.warn('No task data found to seed');
    }
    
    logger.log('Database seeding completed successfully');
    await connection.close();
  } catch (error) {
    logger.error(`Error during database seeding: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap(); 