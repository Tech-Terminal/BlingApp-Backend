import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    const customMessage = this.reflector.get<string>('response_message', context.getHandler());
    
    return next.handle().pipe(
      map((res) => {
        // Automatically flatten PaginatedResult { data: [...], meta: {...} } to eliminate double 'data.data' nesting globally
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            statusCode: response.statusCode,
            message: customMessage || 'Operation successful',
            data: res.data !== undefined ? res.data : [],
            meta: res.meta,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: customMessage || 'Operation successful',
          data: res !== undefined ? res : null,
        };
      }),
    );
  }
}
