import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { DbSeed } from './db-seed';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seed...');

  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get the DataSource from the app
    const dataSource = app.get(DataSource);
    const entityManager = dataSource.manager;

    // Initialize the seeder
    const seeder = new DbSeed(entityManager);
    
    // Run the seed
    await seeder.seed();

    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error during database seeding!');
    console.error(error);
  } finally {
    // Close the application
    await app.close();
  }
}

bootstrap(); 