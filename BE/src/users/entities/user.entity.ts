import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' }) // Specify the table name explicitly
export class User {
  @PrimaryGeneratedColumn('uuid') // Use UUID for primary key
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash' }) // Use snake_case for column name
  passwordHash: string;

  @Column({ length: 100, nullable: true })
  role: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Potential relationships can be added later, e.g.:
  // @OneToMany(() => Task, (task) => task.assignee)
  // assignedTasks: Task[];
} 