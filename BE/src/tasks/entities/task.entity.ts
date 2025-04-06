import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  })
  status: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  assignee: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  tags: string;

  @Column({ nullable: true })
  estimatedHours: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 