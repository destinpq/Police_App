import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

@Entity('project_team_members')
@Unique(['projectId', 'userId']) // Prevent duplicate team members
export class ProjectTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  role: string;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
  joinedAt: Date;
} 