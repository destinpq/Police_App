import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Project } from './projects/entities/project.entity';
import { Tag } from './tags/entities/tag.entity';
import { Department } from './departments/entities/department.entity';
import { Role } from './roles/entities/role.entity';

// Load environment variables
config();

async function fixProjectStartDates() {
  console.log('Fixing null startDate values in projects table...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Task, Project, Tag, Department, Role],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Update any projects with null startDate to set it to the current date
    const result = await dataSource.query(
      `UPDATE "projects" SET "startDate" = NOW() WHERE "startDate" IS NULL`
    );
    
    console.log(`Updated ${result[1] || 0} project records with null startDate values`);
    
    // Check if there are any remaining projects with null startDate
    const remainingNulls = await dataSource.query(
      `SELECT COUNT(*) FROM "projects" WHERE "startDate" IS NULL`
    );
    
    console.log(`Remaining projects with null startDate: ${remainingNulls[0]?.count || 0}`);
    
  } catch (error) {
    console.error('Error fixing project startDate values:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the fix function
fixProjectStartDates()
  .then(() => console.log('Database seed completed'))
  .catch(error => console.error('Error running seed script:', error)); 