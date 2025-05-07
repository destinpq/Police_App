import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT || configService.get<number>('PORT') || 8080;
  
  // Log email configuration
  logger.log('Email configuration:');
  logger.log(`MAIL_HOST: ${configService.get('MAIL_HOST')}`);
  logger.log(`MAIL_PORT: ${configService.get('MAIL_PORT')}`);
  logger.log(`MAIL_USER: ${configService.get('MAIL_USER')}`);
  logger.log(`IMAP_HOST: ${configService.get('IMAP_HOST')}`);
  
  // Enable CORS - using environment variables or defaults
  const clientOrigin = process.env.CLIENT_ORIGIN || configService.get<string>('CLIENT_ORIGIN') || 'http://localhost:3000';
  logger.log(`CORS enabled for origin: ${clientOrigin}`);
  
  app.enableCors({
    origin: clientOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(port);
  const serverUrl = process.env.SERVER_URL || configService.get<string>('SERVER_URL') || `http://localhost:${port}`;
  logger.log(`Backend application running on ${serverUrl}`);
  
  // Seed users after the application starts
  try {
    const seedUrl = `${serverUrl}/login/seed`;
    logger.log(`Attempting to seed users at: ${seedUrl}`);
    await axios.get(seedUrl);
    logger.log('Users seeded successfully');
    
    // Ensure admin status
    const adminResponse = await axios.get(`${serverUrl}/login/ensure-admin`);
    logger.log(`Admin check: ${adminResponse.data.message}`);
  } catch (error) {
    logger.error('Initialization error:', error instanceof Error ? error.message : String(error));
  }
}
bootstrap();
