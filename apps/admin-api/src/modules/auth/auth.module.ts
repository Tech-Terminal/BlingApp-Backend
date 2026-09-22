import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '@libs/config/app.config';

@Module({
  imports: [
    AdminModule,
    JwtModule.register({
      secret: AppConfig.JWT_SECRET,
      signOptions: { expiresIn: AppConfig.JWT_EXPIRES_IN as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule { }
