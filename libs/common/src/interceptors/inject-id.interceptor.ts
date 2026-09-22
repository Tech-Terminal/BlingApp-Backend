import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InjectIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // If there is an ID in the URL params (e.g. /:id) OR the user is authenticated (req.user.id)
    const id = request.params.id || request.user?.id;

    if (id && request.body) {
      request.body.id = Number(id);
    }

    return next.handle();
  }
}
