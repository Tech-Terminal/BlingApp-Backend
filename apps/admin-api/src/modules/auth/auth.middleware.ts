import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // 1. Check Redis blocklist FIRST via AuthService
    const isBlocked = await this.authService.isTokenBlocklisted(token);

    if (isBlocked) {
      throw new UnauthorizedException('Token is blocklisted (user signed out)');
    }

    try {
      // 2. Verify the token using the secret registered in the AuthModule
      const payload = await this.jwtService.verifyAsync(token);

      // 3. Check if the role was updated AFTER this token was issued
      if (payload.role && payload.iat) {
        // payload.iat is in seconds, Date.now() in Redis is in milliseconds
        const isRoleStale = await this.authService.isRoleInvalidated(payload.role.id, payload.iat * 1000);
        if (isRoleStale) {
          throw new UnauthorizedException('Your account or role has been updated by an admin. Please sign in again.');
        }
      }

      // 4. Check if the admin profile itself was updated AFTER this token was issued
      if (payload.id && payload.iat) {
        const isAdminStale = await this.authService.isAdminInvalidated(payload.id, payload.iat * 1000);
        if (isAdminStale) {
          throw new UnauthorizedException('Your account or role has been updated by an admin. Please sign in again.');
        }
      }

      // Attach the decoded admin payload to the request object so controllers can access it
      (req as any).user = payload;
      // Also attach the raw token so controllers (like sign-out) can use it easily
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
