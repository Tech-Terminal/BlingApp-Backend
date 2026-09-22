import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
const ENUM_FIELD_MAP: Record<string, any> = {
};

function transformObjectEnums(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => transformObjectEnums(item));
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const transformed: Record<string, any> = {};

    for (const key of Object.keys(data)) {
      const value = data[key];

      if (
        ENUM_FIELD_MAP[key] &&
        typeof value === 'number' &&
        ENUM_FIELD_MAP[key][value] !== undefined
      ) {
        transformed[key] = ENUM_FIELD_MAP[key][value];
      } else if (typeof value === 'object' && value !== null) {
        transformed[key] = transformObjectEnums(value);
      } else {
        transformed[key] = value;
      }
    }

    return transformed;
  }

  return data;
}

@Injectable()
export class EnumTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => transformObjectEnums(data)),
    );
  }
}
