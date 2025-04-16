import { DataSourceOptions, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Task } from './src/tasks/entities/task.entity';
import { Project } from './src/projects/entities/project.entity';
import { Tag } from './src/tags/entities/tag.entity';
import { Department } from './src/departments/entities/department.entity';
import { Role } from './src/roles/entities/role.entity';
import { FixNullStartDates1721694015000 } from './src/migrations/1721694015000-FixNullStartDates';
import { AddManagerIdToProjects1721710000000 } from './src/migrations/1721710000000-AddManagerIdToProjects';

// Load .env file
config();

const configService = new ConfigService();

// PostgreSQL configuration
const options: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [User, Task, Project, Tag, Department, Role],
  migrations: [FixNullStartDates1721694015000, AddManagerIdToProjects1721710000000],
  synchronize: false, // Disable for production safety
  logging: true,
};

const dataSource = new DataSource(options);
export default dataSource; 