import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMilestonesTable1651234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'milestones',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: "'NOT_STARTED'",
          },
          {
            name: 'deadline',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'project_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for project relationship
    await queryRunner.createForeignKey(
      'milestones',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      }),
    );

    // Add milestone_id column to tasks table
    await queryRunner.query(`
      ALTER TABLE tasks 
      ADD COLUMN milestone_id INT NULL,
      ADD CONSTRAINT fk_tasks_milestone 
      FOREIGN KEY (milestone_id) REFERENCES milestones(id) 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key in tasks table
    await queryRunner.query(`
      ALTER TABLE tasks 
      DROP CONSTRAINT IF EXISTS fk_tasks_milestone,
      DROP COLUMN IF EXISTS milestone_id
    `);

    // Drop foreign key in milestones table
    await queryRunner.dropForeignKey('milestones', 'FK_milestones_project_id');

    // Drop milestones table
    await queryRunner.dropTable('milestones');
  }
} 