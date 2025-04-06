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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Potential relationships can be added later, e.g.:
  // @OneToMany(() => Task, (task) => task.assignee)
  // assignedTasks: Task[];
} 