import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { LoginModule } from './login/login.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { NotificationModule } from './notification/notification.module';
import { ProjectModule } from './project/project.module';
import { Project } from './project/entities/project.entity';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AccuracyRating } from './analytics/entities/accuracy-rating.entity';
import { UserStats } from './analytics/entities/user-stats.entity';
import { ProjectStats } from './analytics/entities/project-stats.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;

        // Heroku specific configuration - parse the DATABASE_URL
        if (databaseUrl) {
          // Support for Heroku PostgreSQL URL format
          // postgres://user:password@host:port/database
          console.log('Using Heroku DATABASE_URL for connection');
          
          // Define the entities
          const entities = [
            User,
            Task,
            Project,
            AccuracyRating,
            UserStats,
            ProjectStats,
          ];
          
          return {
            type: 'postgres',
            url: databaseUrl,
            entities,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false, // Required for Heroku PostgreSQL
            },
          };
        } else if (process.env.DB_HOST && process.env.DB_PORT) {
          // Manual connection configuration from environment variables
          console.log('Using individual environment variables for database connection');
          
          const useSSL = configService.get('DB_SSL') === 'true';
          const dbPort = configService.get('DB_PORT');
          
          return {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: dbPort ? parseInt(dbPort) : 5432,
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [
              User,
              Task,
              Project,
              AccuracyRating,
              UserStats,
              ProjectStats,
            ],
            synchronize: true,
            ssl: useSSL ? { rejectUnauthorized: false } : false,
          };
        } else {
          // Fallback for local development
          console.log('Using fallback local database connection');
          
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'tasktracker',
            entities: [
              User,
              Task,
              Project,
              AccuracyRating,
              UserStats,
              ProjectStats,
            ],
            synchronize: true,
          };
        }
      },
    }),
    TasksModule,
    LoginModule,
    UserModule,
    NotificationModule,
    ProjectModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
