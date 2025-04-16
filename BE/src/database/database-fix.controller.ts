import { Controller, Post, Get, Logger } from '@nestjs/common';
import { DatabaseFixService } from './database-fix.service';

@Controller('database-fix')
export class DatabaseFixController {
  private readonly logger = new Logger(DatabaseFixController.name);

  constructor(private readonly databaseFixService: DatabaseFixService) {}

  @Get()
  async checkFixNeeded() {
    this.logger.log('Checking if database fixes are needed');
    const projectIssues = await this.databaseFixService.checkProjectsFixNeeded();
    const taskIssues = await this.databaseFixService.checkTasksFixNeeded();
    
    return {
      needsFix: projectIssues.needsFix || taskIssues.needsFix,
      issues: {
        projects: projectIssues,
        tasks: taskIssues
      }
    };
  }

  @Post('projects')
  async fixProjects() {
    this.logger.log('Running database fix for projects table');
    const result = await this.databaseFixService.fixProjectsTable();
    
    return {
      success: true,
      message: 'Projects table fixed successfully',
      details: result
    };
  }

  @Post('tasks')
  async fixTasks() {
    this.logger.log('Running database fix for tasks table');
    const result = await this.databaseFixService.fixTasksTable();
    
    return {
      success: true,
      message: 'Tasks table fixed successfully',
      details: result
    };
  }

  @Post('fix-all')
  async fixAll() {
    this.logger.log('Running database fix for all tables');
    
    const projectsResult = await this.databaseFixService.fixProjectsTable();
    const tasksResult = await this.databaseFixService.fixTasksTable();
    
    return {
      success: true,
      message: 'Database fixes applied successfully',
      details: {
        projects: projectsResult,
        tasks: tasksResult
      }
    };
  }
} 