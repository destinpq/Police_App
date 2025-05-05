import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBudgetFields1683564000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS budget FLOAT NULL,
      ADD COLUMN IF NOT EXISTS budget_spent FLOAT NULL,
      ADD COLUMN IF NOT EXISTS budget_currency VARCHAR(10) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects
      DROP COLUMN IF EXISTS budget,
      DROP COLUMN IF EXISTS budget_spent,
      DROP COLUMN IF EXISTS budget_currency;
    `);
  }
} 