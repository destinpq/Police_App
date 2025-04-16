import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNullStartDates1721694015000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update projects with null start dates to use their creation date
    await queryRunner.query(`
      UPDATE projects 
      SET start_date = created_at 
      WHERE start_date IS NULL
    `);

    console.log('Migration: Updated null start dates');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Not implemented since we can't revert this data change
    console.log('This migration cannot be reverted');
  }
} 