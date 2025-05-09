import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { ProjectSeed } from './seed/project.seed';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User]), AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectSeed],
  exports: [ProjectService, ProjectSeed],
})
export class ProjectModule {}
// End of file  