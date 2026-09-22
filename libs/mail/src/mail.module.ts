import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { AppConfig } from '@libs/config/app.config';
import { MailService } from './mail.service';
import * as path from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: AppConfig.MAIL_HOST,
          port: AppConfig.MAIL_PORT,
          secure: AppConfig.MAIL_PORT === 465, // true for 465, false for other ports
          auth: {
            user: AppConfig.MAIL_USERNAME,
            pass: AppConfig.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"${AppConfig.MAIL_FROM_NAME}" <${AppConfig.MAIL_FROM_ADDRESS}>`,
        },
        template: {
          dir: path.join(process.cwd(), 'resources', 'views', 'mail'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          layout: 'main',
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
