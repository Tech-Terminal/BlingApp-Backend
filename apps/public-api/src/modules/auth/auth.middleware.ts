import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // 1. Check Redis blocklist
    const isBlocked = await this.authService.isTokenBlocklisted(token);
    if (isBlocked) {
      throw new UnauthorizedException('Token is blocklisted (user signed out or token refreshed)');
    }

    try {
      // 2. Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // 3. Check if user was invalidated after token issued
      if (payload.id && payload.iat) {
        const isStale = await this.authService.isUserInvalidated(
          payload.id,
          payload.iat * 1000,
        );
        if (isStale) {
          throw new UnauthorizedException(
            'Your account details have been updated. Please sign in again.',
          );
        }
      }

      (req as any).user = payload;
      (req as any).token = token;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
}
