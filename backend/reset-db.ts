import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './src/user/entities/user.entity';
import { Task } from './src/tasks/entities/task.entity';
import { Project } from './src/project/entities/project.entity';

// Load environment variables
config();

const configService = new ConfigService();

async function resetDatabase() {
  console.log('Connecting to database...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [User, Task, Project],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    console.log('Dropping all tables...');
    await dataSource.dropDatabase();
    console.log('Database reset complete');
    
    console.log('Creating new tables...');
    await dataSource.synchronize();
    console.log('Tables created successfully');
    
    console.log('Database has been reset');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

resetDatabase().catch(err => {
  console.error('Failed to reset database:', err);
  process.exit(1);
}); 