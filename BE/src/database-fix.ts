import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DatabaseFixService } from './database/database-fix.service';

async function bootstrap() {
  const logger = new Logger('DatabaseFixScript');
  console.log('Starting database fix script...');
  logger.log('Starting database fix script...');

  try {
    console.log('Creating application context...');
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('Application context created');
    
    console.log('Getting DatabaseFixService...');
    const databaseFixService = app.get(DatabaseFixService);
    console.log('DatabaseFixService retrieved');

    console.log('Running fix for project manager_id values...');
    logger.log('Running fix for project manager_id values...');
    await databaseFixService.fixProjectsManagerId();
    
    console.log('Running fix for project department_id values...');
    logger.log('Running fix for project department_id values...');
    await databaseFixService.fixProjectsDepartmentId();
    
    console.log('Running fix for tasks table...');
    logger.log('Running fix for tasks table...');
    await databaseFixService.fixTasksTable();
    
    console.log('Database fix completed successfully.');
    logger.log('Database fix completed successfully.');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error during database fix: ${error.message}`, error.stack);
    logger.error(`Error during database fix: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap(); 