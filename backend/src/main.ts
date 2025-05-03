import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  
  // Log email configuration
  logger.log('Email configuration:');
  logger.log(`MAIL_HOST: ${configService.get('MAIL_HOST')}`);
  logger.log(`MAIL_PORT: ${configService.get('MAIL_PORT')}`);
  logger.log(`MAIL_USER: ${configService.get('MAIL_USER')}`);
  logger.log(`IMAP_HOST: ${configService.get('IMAP_HOST')}`);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(port);
  logger.log(`Backend application running on http://localhost:${port}`);
  
  // Seed users after the application starts
  try {
    await axios.get(`http://localhost:${port}/login/seed`);
    logger.log('Users seeded successfully');
    
    // Ensure admin status
    const adminResponse = await axios.get(`http://localhost:${port}/login/ensure-admin`);
    logger.log(`Admin check: ${adminResponse.data.message}`);
  } catch (error) {
    logger.error('Initialization error:', error instanceof Error ? error.message : String(error));
  }
}
bootstrap();
