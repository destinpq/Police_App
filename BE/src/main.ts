import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('Starting NestJS application...');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS for all origins in development
  app.enableCors({
    origin: true, // Allow all origins 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    exposedHeaders: 'Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Use cookie parser middleware
  app.use(cookieParser());
  
  // Set global prefix for API endpoints
  app.setGlobalPrefix('api');
  
  // Validate all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not defined in DTOs
      transform: true, // transform payloads to be objects typed according to DTOs
      forbidNonWhitelisted: true, // throw errors if non-whitelisted properties are present
    }),
  );

  // Use global exception filter to standardize error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Default port to 3001 for consistency with frontend config
  const port = configService.get<number>('PORT', 3001);
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
