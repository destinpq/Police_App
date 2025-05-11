import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Milestone } from './milestone.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true, type: 'float' })
  budget: number;

  @Column({ nullable: true, type: 'float' })
  budgetSpent: number;

  @Column({ nullable: true })
  budgetCurrency: string;

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @OneToMany(() => Milestone, milestone => milestone.project)
  milestones: Milestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}