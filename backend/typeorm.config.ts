import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/user/entities/user.entity';
import { Task } from './src/tasks/entities/task.entity';
import { Project } from './src/project/entities/project.entity';
import { Milestone } from './src/project/entities/milestone.entity';
import { AccuracyRating } from './src/analytics/entities/accuracy-rating.entity';
import { UserStats } from './src/analytics/entities/user-stats.entity';
import { ProjectStats } from './src/analytics/entities/project-stats.entity';
import { CreateMilestonesTable1651234567890 } from './src/migrations/1651234567890-CreateMilestonesTable';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Task, Project, Milestone, AccuracyRating, UserStats, ProjectStats],
  migrations: [CreateMilestonesTable1651234567890],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default dataSource; 