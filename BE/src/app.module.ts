import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DepartmentsModule } from './departments/departments.module';
import { RolesModule } from './roles/roles.module';
import { DatabaseFixModule } from './database/database-fix.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Project } from './projects/entities/project.entity';
import { Tag } from './tags/entities/tag.entity';
import { Department } from './departments/entities/department.entity';
import { Role } from './roles/entities/role.entity';
import { FixNullStartDates1721694015000 } from './migrations/1721694015000-FixNullStartDates';
import { AddManagerIdToProjects1721710000000 } from './migrations/1721710000000-AddManagerIdToProjects';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Ensure .env is in BE directory
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('Using PostgreSQL database');
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [User, Task, Project, Tag, Department, Role],
          synchronize: false, // Disable automatic synchronization for production safety
          logging: true,
          autoLoadEntities: true,
          migrationsRun: true, // Run migrations automatically
          migrations: [FixNullStartDates1721694015000, AddManagerIdToProjects1721710000000],
        };
      },
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    TagsModule,
    SeedModule,
    AnalyticsModule,
    DepartmentsModule,
    RolesModule,
    DatabaseFixModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
