import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { NotificationModule } from '../notification/notification.module';
import { TaskSeed } from './seed/tasks.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Project]),
    NotificationModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskSeed],
  exports: [TasksService, TaskSeed]
})
export class TasksModule {}
