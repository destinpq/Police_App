import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity({ name: 'users' }) // Specify the table name explicitly
export class User {
  @PrimaryGeneratedColumn('uuid') // Use UUID for primary key
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', select: false }) // Use snake_case and hide by default
  passwordHash: string;

  // Relation to Role
  @ManyToOne(() => Role, { nullable: true, eager: false }) // Eager false by default, load manually
  @JoinColumn({ name: 'role_id' }) // Explicit join column name
  role: Role | null; // Store the full Role object

  @Column({ name: 'role_id', type: 'uuid', nullable: true }) // Store the role ID separately if needed, or let TypeORM handle it
  roleId: string | null;

  // Relation to Department
  @ManyToOne(() => Department, { nullable: true, eager: false }) // Eager false by default, load manually
  @JoinColumn({ name: 'department_id' }) // Explicit join column name
  department: Department | null; // Store the full Department object

  @Column({ name: 'department_id', type: 'uuid', nullable: true }) // Store the department ID separately if needed
  departmentId: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Potential relationships can be added later, e.g.:
  // @OneToMany(() => Task, (task) => task.assignee)
  // assignedTasks: Task[];
} 