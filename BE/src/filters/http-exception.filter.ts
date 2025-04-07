import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter
 * 
 * Provides standardized error responses and logging for all HTTP exceptions.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status: number;
    let message: string;
    let code: string;
    
    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || 'http_error';
      } else {
        message = exception.message;
        code = 'http_error';
      }
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'internal_server_error';
    }
    
    // Log the error with relevant request details
    this.logger.error(`[${request.method}] ${request.url} - ${status} ${message}`, exception.stack);
    
    // Return a standardized error response
    response.status(status).json({
      status: 'error',
      error: {
        code,
        message,
        // Include validation errors if available
        details: exception.response?.errors || null,
        // Include timestamp for debugging
        timestamp: new Date().toISOString(),
      },
      path: request.url,
    });
  }
} 