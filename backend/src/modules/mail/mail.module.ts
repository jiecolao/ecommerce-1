import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.get('SMTP_PORT')) || 587;

        return {
          transport: {
            host: configService.get('SMTP_HOST'),
            port: port,
            secure: port === 465,
            auth: {
              user: configService.get('SMTP_USER'),
              pass: configService.get('SMTP_PASS'),
            },
          },
          defaults: {
            from: `"No Reply" <${configService.get('SMTP_FROM')}>`,
          } as any, // 👈 Bypass the nodemailer 'Options' type collision
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}