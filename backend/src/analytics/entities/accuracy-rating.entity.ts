import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('accuracy_ratings')
export class AccuracyRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  taskId: number;

  @Column()
  adminId: number;

  @Column()
  accuracyScore: number; // 0-100 score

  @Column()
  qualityRating: number; // 1-5 stars

  @Column({ nullable: true })
  feedback: string; // Admin feedback on accuracy/quality

  @CreateDateColumn()
  ratedAt: Date;
} 