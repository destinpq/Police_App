import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';

// Add global crypto polyfill if it doesn't exist
if (typeof (global as any).crypto === 'undefined') {
  // @ts-expect-error - Adding to global
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
  };
}

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

  // Enable CORS with support for multiple origins
  // Format for CLIENT_ORIGIN can be a single URL or comma-separated list:
  // e.g., https://example.com or https://example.com,https://another.com
  const clientOriginEnv =
    process.env.CLIENT_ORIGIN ||
    configService.get<string>('CLIENT_ORIGIN') ||
    'http://localhost:3000,https://task.destinpq.com';

  // Parse origin(s) - either a single string or array of allowed origins
  let origins:
    | string
    | string[]
    | RegExp
    | RegExp[]
    | ((
        origin: string,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);

  if (clientOriginEnv.includes(',')) {
    // Handle multiple origins
    origins = clientOriginEnv.split(',').map((origin) => origin.trim());
    logger.log(`CORS enabled for multiple origins: ${origins.join(', ')}`);
  } else {
    // Single origin
    origins = clientOriginEnv;
    logger.log(`CORS enabled for origin: ${origins}`);
  }
  
  app.enableCors({
    origin: origins,
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
