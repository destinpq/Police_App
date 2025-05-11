import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Milestone } from '../../project/entities/milestone.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['OPEN', 'IN_PROGRESS', 'DONE'],
    default: 'OPEN'
  })
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';

  @ManyToOne(() => User, user => user.tasks, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @Column({ nullable: true })
  assignee_id: number | null;

  @ManyToOne(() => Project, project => project.tasks, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: number;

  @ManyToOne(() => Milestone, milestone => milestone.tasks, { nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone | null;

  @Column({ nullable: true })
  milestone_id: number | null;

  @Column({ nullable: true, type: 'timestamp' })
  deadline: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date | null;

  @Column({ nullable: true, type: 'float', default: 0 })
  moneySpent: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 