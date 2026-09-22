import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import * as path from 'path';
import { EVENTS } from '@libs/index';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  // Default logo attachment for all emails
  private readonly defaultAttachments = [
    {
      filename: 'logo.png',
      path: path.join(process.cwd(), 'resources', 'assets', 'logo.png'),
      cid: 'logo' // matches cid:logo in the HTML templates
    }
  ];

  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(EVENTS.MAIL.SEND_RESET_OTP)
  async sendResetPasswordOtp(payload: { email: string; otp: string }): Promise<void> {
    const { email: to, otp } = payload;
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Reset Your Password - OTP',
        template: 'reset_password_otp',
        context: {
          otp,
          year: new Date().getFullYear(),
        },
        attachments: this.defaultAttachments,
      });
      this.logger.log(`Reset password OTP email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password OTP to ${to}`, error);
    }
  }

  @OnEvent(EVENTS.MAIL.SEND_EMAIL_CHANGE_OTP)
  async sendEmailChangeOtp(payload: { email: string; otp: string }): Promise<void> {
    const { email: to, otp } = payload;
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Verify Your New Email Address',
        template: 'email_change_otp',
        context: {
          otp,
          year: new Date().getFullYear(),
        },
        attachments: this.defaultAttachments,
      });
      this.logger.log(`Email change OTP sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email change OTP to ${to}`, error);
    }
  }

  @OnEvent(EVENTS.MAIL.SEND_ADMIN_CREDENTIALS)
  async sendNewAdminCredentials(payload: { email: string; name: string; plainTextPassword: string }): Promise<void> {
    const { email: to, name, plainTextPassword } = payload;
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to the Admin Portal',
        template: 'admin_credentials',
        context: {
          name,
          email: to,
          plainTextPassword,
          year: new Date().getFullYear(),
        },
        attachments: this.defaultAttachments,
      });
      this.logger.log(`New admin credentials sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send admin credentials to ${to}`, error);
    }
  }

  @OnEvent(EVENTS.MAIL.SEND_COMPANY_REQUEST_REJECTION)
  async sendCompanyRequestRejection(payload: { email: string; contactName: string; companyName: string; rejectionReason?: string }): Promise<void> {
    const { email: to, contactName, companyName, rejectionReason } = payload;
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'تحديث بشأن طلب تسجيل الشركة - Bling',
        template: 'company_request_rejection',
        context: {
          contactName,
          companyName,
          rejectionReason,
          year: new Date().getFullYear(),
        },
        attachments: this.defaultAttachments,
      });
      this.logger.log(`Company request rejection email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send company request rejection email to ${to}`, error);
    }
  }
}
