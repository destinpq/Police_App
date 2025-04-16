import { Controller, Get, Post, Body, Logger, Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource
  ) {}
  
  private startTime = Date.now();

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    // Check database connection
    let dbStatus = 'unknown';
    let dbError: string | null = null;
    
    try {
      // Try to query the database
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
      } else {
        dbStatus = 'disconnected';
        dbError = 'DataSource is not initialized';
      }
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
      this.logger.error(`Database health check failed: ${error.message}`, error.stack);
    }
    
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        error: dbError,
        type: this.dataSource?.options?.type || 'unknown'
      }
    };
  }
  
  @Get('ping')
  ping() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const uptimeFormatted = this.formatUptime(uptime);
    
    return {
      success: true,
      message: 'API server is running and accessible',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: this.formatBytes(os.totalmem()),
          free: this.formatBytes(os.freemem()),
          usagePercent: Math.round((1 - os.freemem() / os.totalmem()) * 100)
        },
        load: os.loadavg().map(load => load.toFixed(2))
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }
  
  @Post('api/test-endpoint')
  testEndpoint(@Body() body: any) {
    this.logger.log('Test endpoint called with body:');
    this.logger.log(JSON.stringify(body, null, 2));
    return { 
      success: true, 
      message: 'Request received successfully', 
      receivedBody: body 
    };
  }
  
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= (3600 * 24);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
