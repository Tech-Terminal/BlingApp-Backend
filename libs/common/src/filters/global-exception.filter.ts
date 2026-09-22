import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = { general: ['Internal server error'] };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      // If it's our custom formatted ValidationPipe error (422)
      if (status === HttpStatus.UNPROCESSABLE_ENTITY && exceptionResponse.errors) {
        message = exceptionResponse.message || 'Validation Failed';
        errors = exceptionResponse.errors;
      } else {
        // For other HttpExceptions (Conflict, NotFound, etc.)
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse.message || exception.message);
          
        if (Array.isArray(message)) {
            errors = { general: message };
            message = message[0] + (message.length > 1 ? ` (and ${message.length - 1} more errors)` : '');
        } else {
            errors = { general: [message] };
        }
      }
    } else if (exception instanceof Error) {
        // Fallback for non-Http exceptions
        message = exception.message;
        errors = { general: [exception.message] };
    }

    response
      .status(status)
      .json({
        success: false,
        statusCode: status,
        message,
        errors,
        data: null
      });
  }
}
