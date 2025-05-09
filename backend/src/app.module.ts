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
        const entities = [
          User,
          Task,
          Project,
          AccuracyRating,
          UserStats,
          ProjectStats,
        ];
        
        // Always use Digital Ocean configuration
        console.log('Using Digital Ocean PostgreSQL connection');
        const useSSL = configService.get('DB_SSL') === 'true';
        const sslMode = configService.get('DB_SSL_MODE');
        const dbPort = configService.get('DB_PORT');
        
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: dbPort ? parseInt(dbPort) : 5432,
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities,
          synchronize: true,
          ssl: useSSL ? { 
            rejectUnauthorized: false,
            mode: sslMode
          } : false,
          logging: ["query", "error"],
          logger: "advanced-console",
        };
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
