import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  console.log('Starting NestJS application...');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global URL prefix
  app.setGlobalPrefix('api');
  
  console.log('Configuring CORS...');
  // Configure CORS for frontend access
  app.enableCors({
    origin: true, // Allow any origin temporarily for debugging
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTOs
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties present
      transform: true, // Transform payloads to DTO instances
    }),
  );

  // Use global exception filter for standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Start the server
  const port = configService.get<number>('PORT', 8888);
  const host = '0.0.0.0'; // Listen on all network interfaces
  console.log(`Starting server on ${host}:${port}...`);
  
  try {
    await app.listen(port, host);
    console.log(`Application running on port ${port}`);
    console.log(`API is available at http://localhost:${port}/api`);
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
}
bootstrap();
