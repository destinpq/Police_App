import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { ProjectSeed } from './seed/project.seed';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entities/user.entity';
import { MilestoneService } from './milestone.service';
import { MilestoneController } from './milestone.controller';
import { Milestone } from './entities/milestone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Milestone]), AuthModule],
  controllers: [ProjectController, MilestoneController],
  providers: [ProjectService, ProjectSeed, MilestoneService],
  exports: [ProjectService, ProjectSeed, MilestoneService],
})
export class ProjectModule {}
// End of file  