import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Assuming path
import { Project } from '../../projects/entities/project.entity'; // Assuming path

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'text',
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @Column({
    type: 'text',
    default: 'todo',
  })
  status: 'todo' | 'in-progress' | 'done';

  @Column({ nullable: true, type: 'timestamp' })
  dueDate: Date | null;

  // Assignee Relation
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @Column({ type: 'uuid', name: 'assignee_id', nullable: true })
  assigneeId: string | null;

  // Project Relation
  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({ type: 'uuid', name: 'project_id', nullable: true })
  projectId: string | null;

  @Column({ type:'text', nullable: true })
  tags: string | null;

  @Column({ type:'text', nullable: true })
  estimatedHours: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
} 