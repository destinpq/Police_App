import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Project } from './project.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true, type: 'timestamp' })
  deadline: Date | null;

  @Column({ 
    type: 'enum', 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED'
  })
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

  @ManyToOne(() => Project, project => project.milestones, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: number;

  @OneToMany(() => Task, task => task.milestone)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 