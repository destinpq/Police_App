import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { AccuracyRating } from './entities/accuracy-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Project, AccuracyRating])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 