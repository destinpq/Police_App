import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task, Project]),
    UsersModule,
    TasksModule,
    ProjectsModule,
    // Other modules will be added as they're created
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {} 