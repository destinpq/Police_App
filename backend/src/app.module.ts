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

        if (databaseUrl) {
          // Use Heroku's DATABASE_URL if available
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false, // Required for Heroku PostgreSQL
            },
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
        } else {
          // Use local configuration
          return {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
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
