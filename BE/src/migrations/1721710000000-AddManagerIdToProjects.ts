import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagerIdToProjects1721710000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if the manager_id column already exists to avoid errors
    const tableColumns = await queryRunner.getTable('projects');
    const managerIdColumn = tableColumns?.findColumnByName('manager_id');
    const departmentIdColumn = tableColumns?.findColumnByName('department_id');

    // Add the manager_id column if it doesn't exist
    if (!managerIdColumn) {
      await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "manager_id" UUID REFERENCES "users"("id")`);
    }

    // Add the department_id column if it doesn't exist
    if (!departmentIdColumn) {
      await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "department_id" UUID REFERENCES "departments"("id")`);
    }

    console.log('Successfully added manager_id and department_id columns to projects table if needed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the columns exist before trying to drop them
    const tableColumns = await queryRunner.getTable('projects');
    const managerIdColumn = tableColumns?.findColumnByName('manager_id');
    const departmentIdColumn = tableColumns?.findColumnByName('department_id');

    if (managerIdColumn) {
      await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "manager_id"`);
    }

    if (departmentIdColumn) {
      await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "department_id"`);
    }
    
    console.log('Successfully dropped manager_id and department_id columns from projects table if they existed');
  }
} 