import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Service to handle fixing database issues
 */
@Injectable()
export class DatabaseFixService {
  private readonly logger = new Logger(DatabaseFixService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  /**
   * Check if projects table needs fixing
   */
  async checkProjectsFixNeeded(): Promise<{ needsFix: boolean; nullManagerCount: number; nullDepartmentCount: number }> {
    try {
      // Check for null manager_id
      const managerResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM projects WHERE manager_id IS NULL`
      );
      const nullManagerCount = parseInt(managerResult[0].count);
      
      // Check for null department_id
      const deptResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM projects WHERE department_id IS NULL`
      );
      const nullDepartmentCount = parseInt(deptResult[0].count);
      
      return {
        needsFix: nullManagerCount > 0 || nullDepartmentCount > 0,
        nullManagerCount,
        nullDepartmentCount
      };
    } catch (error) {
      this.logger.error(`Error checking projects table: ${error.message}`, error.stack);
      return {
        needsFix: false,
        nullManagerCount: 0,
        nullDepartmentCount: 0
      };
    }
  }
  
  /**
   * Check if tasks table needs fixing
   */
  async checkTasksFixNeeded(): Promise<{ needsFix: boolean; nullAssigneeCount: number; nullProjectCount: number }> {
    try {
      // Check for null assignee_id
      const assigneeResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id IS NULL`
      );
      const nullAssigneeCount = parseInt(assigneeResult[0].count);
      
      // Check for null project_id
      const projectResult = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM tasks WHERE project_id IS NULL`
      );
      const nullProjectCount = parseInt(projectResult[0].count);
      
      return {
        needsFix: nullAssigneeCount > 0 || nullProjectCount > 0,
        nullAssigneeCount,
        nullProjectCount
      };
    } catch (error) {
      this.logger.error(`Error checking tasks table: ${error.message}`, error.stack);
      return {
        needsFix: false,
        nullAssigneeCount: 0,
        nullProjectCount: 0
      };
    }
  }

  /**
   * Fix null manager_id in projects table.
   * This sets a default manager_id for projects that don't have one.
   */
  async fixProjectsManagerId(): Promise<{ fixed: boolean; count: number }> {
    this.logger.log('Fixing null manager_id values in projects table...');

    try {
      // Check if there are any null values in the manager_id column
      const nullManagerCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM projects WHERE manager_id IS NULL`
      );

      const count = parseInt(nullManagerCount[0].count);
      this.logger.log(`Found ${count} projects with null manager_id`);

      if (count > 0) {
        // Try to find a valid user ID to use as the default manager
        const userResult = await this.dataSource.query(
          `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`
        );

        if (userResult && userResult.length > 0) {
          const defaultUserId = userResult[0].id;
          this.logger.log(`Using default user ID: ${defaultUserId}`);

          // Update records with null manager_id
          const updateResult = await this.dataSource.query(
            `UPDATE projects SET manager_id = $1 WHERE manager_id IS NULL`,
            [defaultUserId]
          );

          this.logger.log(`Successfully updated ${count} projects with default manager_id`);
          return { fixed: true, count };
        } else {
          this.logger.warn('No users found to use as default manager');
          return { fixed: false, count };
        }
      }
      return { fixed: false, count: 0 };
    } catch (error) {
      this.logger.error(`Error fixing manager_id: ${error.message}`, error.stack);
      return { fixed: false, count: 0 };
    }
  }

  /**
   * Fix null department_id in projects table.
   * This sets a default department_id for projects that don't have one.
   */
  async fixProjectsDepartmentId(): Promise<{ fixed: boolean; count: number }> {
    this.logger.log('Fixing null department_id values in projects table...');

    try {
      // Check if there are any null values in the department_id column
      const nullDeptCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM projects WHERE department_id IS NULL`
      );

      const count = parseInt(nullDeptCount[0].count);
      this.logger.log(`Found ${count} projects with null department_id`);

      if (count > 0) {
        // Try to find a valid department ID to use as the default
        const deptResult = await this.dataSource.query(
          `SELECT id FROM departments ORDER BY created_at ASC LIMIT 1`
        );

        if (deptResult && deptResult.length > 0) {
          const defaultDeptId = deptResult[0].id;
          this.logger.log(`Using default department ID: ${defaultDeptId}`);

          // Update records with null department_id
          const updateResult = await this.dataSource.query(
            `UPDATE projects SET department_id = $1 WHERE department_id IS NULL`,
            [defaultDeptId]
          );

          this.logger.log(`Successfully updated ${count} projects with default department_id`);
          return { fixed: true, count };
        } else {
          this.logger.warn('No departments found to use as default department');
          return { fixed: false, count };
        }
      }
      return { fixed: false, count: 0 };
    } catch (error) {
      this.logger.error(`Error fixing department_id: ${error.message}`, error.stack);
      return { fixed: false, count: 0 };
    }
  }

  /**
   * Fix the projects table by ensuring required fields have valid values
   */
  async fixProjectsTable(): Promise<{ managerIds: { fixed: boolean; count: number }, departmentIds: { fixed: boolean; count: number } }> {
    const managerIds = await this.fixProjectsManagerId();
    const departmentIds = await this.fixProjectsDepartmentId();
    return { managerIds, departmentIds };
  }

  /**
   * Fix tasks with null assignee_id or project_id
   */
  async fixTasksTable(): Promise<{ assigneeIds: { fixed: boolean; count: number }, projectIds: { fixed: boolean; count: number } }> {
    this.logger.log('Fixing tasks table...');
    
    let assigneeIds = { fixed: false, count: 0 };
    let projectIds = { fixed: false, count: 0 };
    
    try {
      // Check for null assigneeId
      const nullAssigneeCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id IS NULL`
      );
      
      const assigneeCount = parseInt(nullAssigneeCount[0].count);
      if (assigneeCount > 0) {
        this.logger.log(`Found ${assigneeCount} tasks with null assignee_id`);
        
        // Get a valid user to assign tasks to
        const userResult = await this.dataSource.query(
          `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`
        );
        
        if (userResult && userResult.length > 0) {
          const defaultUserId = userResult[0].id;
          
          // Update null assignee_id with default user
          await this.dataSource.query(
            `UPDATE tasks SET assignee_id = $1 WHERE assignee_id IS NULL`,
            [defaultUserId]
          );
          
          this.logger.log(`Updated ${assigneeCount} tasks with default assignee_id`);
          assigneeIds = { fixed: true, count: assigneeCount };
        } else {
          this.logger.warn('No users found to use as default assignee');
        }
      }
      
      // Check for null projectId
      const nullProjectCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM tasks WHERE project_id IS NULL`
      );
      
      const projectCount = parseInt(nullProjectCount[0].count);
      if (projectCount > 0) {
        this.logger.log(`Found ${projectCount} tasks with null project_id`);
        
        // Get a valid project to assign tasks to
        const projectResult = await this.dataSource.query(
          `SELECT id FROM projects ORDER BY created_at ASC LIMIT 1`
        );
        
        if (projectResult && projectResult.length > 0) {
          const defaultProjectId = projectResult[0].id;
          
          // Update null project_id with default project
          await this.dataSource.query(
            `UPDATE tasks SET project_id = $1 WHERE project_id IS NULL`,
            [defaultProjectId]
          );
          
          this.logger.log(`Updated ${projectCount} tasks with default project_id`);
          projectIds = { fixed: true, count: projectCount };
        } else {
          this.logger.warn('No projects found to use as default project');
        }
      }
      
      this.logger.log('Tasks table fixed successfully');
      return { assigneeIds, projectIds };
    } catch (error) {
      this.logger.error(`Error fixing tasks table: ${error.message}`, error.stack);
      return { assigneeIds, projectIds };
    }
  }
} 