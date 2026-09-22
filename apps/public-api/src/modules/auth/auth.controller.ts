import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterClientDto } from './dto/register-client.dto';
import { ClientSignInDto } from './dto/client-sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import {
  ResponseMessage,
  RefreshTokenDto,
} from '@libs/index';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({
    short: { limit: 1, ttl: 10000 }, // 10 seconds (~0.16 mins)
    medium: { limit: 3, ttl: 60000 }, // 1 min
    long: { limit: 5, ttl: 900000 }, // 15 mins
  })
  @Post('register')
  @ResponseMessage('تم إرسال رمز التحقق بنجاح')
  async register(@Body() dto: RegisterClientDto) {
    return this.authService.register(dto);
  }

  @Post('verify-register-otp')
  @ResponseMessage('تم إنشاء الحساب بنجاح')
  async verifyRegisterOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegisterOtp(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({
    short: { limit: 1, ttl: 10000 }, // 10 seconds (~0.16 mins)
    medium: { limit: 3, ttl: 60000 }, // 1 min
    long: { limit: 5, ttl: 900000 }, // 15 mins
  })
  @Post('sign-in')
  @ResponseMessage('تم إرسال رمز التحقق بنجاح')
  async signIn(@Body() dto: ClientSignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('verify-login-otp')
  @ResponseMessage('تم تسجيل الدخول بنجاح')
  async verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({
    short: { limit: 1, ttl: 10000 }, // 10 seconds (~0.16 mins)
    medium: { limit: 3, ttl: 60000 }, // 1 min
    long: { limit: 5, ttl: 900000 }, // 15 mins
  })
  @Post('resend-otp')
  @ResponseMessage('تم إعادة إرسال رمز التحقق بنجاح')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('refresh')
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    return this.authService.refreshTokens(dto, headerToken);
  }

  @Post('sign-out')
  @ResponseMessage('تم تسجيل الخروج بنجاح')
  async signOut(
    @Req() req: Request,
    @Body() refreshTokenDto?: RefreshTokenDto,
  ) {
    const token = (req as any).token;
    return this.authService.signOut(token, refreshTokenDto);
  }

  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user.id || (req as any).user.sub;
    return this.authService.getProfile(userId);
  }
}
