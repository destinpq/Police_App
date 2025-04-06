import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module'; // Commented out: Not created yet
// import { TagsModule } from './tags/tags.module'; // Commented out: Not created yet
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Project } from './projects/entities/project.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Ensure .env is in BE directory
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Task, Project], // Explicit entity list
        synchronize: true, // Always true for now during development
        logging: true,     // Always log SQL queries
        extra: {
          trustServerCertificate: true,
        },
        ssl: false,        // Disable SSL for local development
        autoLoadEntities: true,
      }),
    }),
    // AuthModule, // Commented out
    UsersModule,
    ProjectsModule,
    TasksModule,
    // TagsModule, // Commented out
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
