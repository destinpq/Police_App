import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity';
import { ProjectSeed } from './project/seed/project.seed';
import { TaskSeed } from './tasks/seed/tasks.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const projectSeed = app.get(ProjectSeed);
  const taskSeed = app.get(TaskSeed);

  console.log('Starting database seeding...');

  // Seed users
  const users = [
    { email: 'drakankasha@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
    { email: 'pratik@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
    { email: 'shauryabansal@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
    { email: 'mohitagrwal@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
    { email: 'tejaswi.ranganeni@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
    { email: 'admin@destinpq.com', password: 'DestinPQ@24225', isAdmin: true },
  ];

  try {
    // Check if users exist
    const existingUsers = await userService.findAll();
    
    if (existingUsers.length === 0) {
      console.log('Seeding users...');
      for (const userData of users) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
      }
      console.log('Users seeded successfully');
    } else {
      console.log('Users already exist in database');
    }

    // Seed projects
    await projectSeed.seed();
    
    // Seed tasks
    await taskSeed.seed();

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 