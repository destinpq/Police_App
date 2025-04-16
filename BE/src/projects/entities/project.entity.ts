import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column({
    type: 'text',
    default: 'planning',
  })
  status: 'planning' | 'active' | 'on-hold' | 'completed';

  @Column({
    type: 'text',
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User | null;

  @Column({ type: 'uuid', name: 'manager_id', nullable: true })
  managerId: string | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  departmentId: string | null;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true, type: 'text' })
  tags: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
} 