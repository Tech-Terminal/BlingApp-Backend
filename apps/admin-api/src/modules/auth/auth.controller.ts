import { AuthService } from './auth.service';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import {
    ResponseMessage,
    SignInDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyOtpDto,
    RefreshTokenDto,
} from '@libs/index';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post("sign-in")
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto)
    }

    @Post("refresh")
    async refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: Request) {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        return this.authService.refreshTokens(dto, headerToken)
    }

    @Post("sign-out")
    @ResponseMessage('Successfully signed out')
    async signOut(@Req() req: Request, @Body() refreshTokenDto?: RefreshTokenDto) {
        // The token is attached to the request by the AuthMiddleware
        const token = (req as any).token;
        return this.authService.signOut(token, refreshTokenDto)
    }

    @Post("forgot-password")
    @ResponseMessage('OTP sent successfully.')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post("verify-otp")
    @ResponseMessage('OTP verified successfully.')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post("reset-password")
    @ResponseMessage('Password reset successfully. You can now sign in.')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

}
