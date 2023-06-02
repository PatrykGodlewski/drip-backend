import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';

  @Module({
    imports: [
      JwtModule.register({}),
      MailerModule.forRootAsync({
        useFactory: (config: ConfigService) => ({
          transport: {
            host: config.get('MAIL_HOST'),
            port: config.get('MAIL_PORT'),
            secure: false,
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: config.get('MAIL_FROM'),
          },
        }),
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
  })
  export (class AuthModule {
    constructor(private config: ConfigService) {
      console.log(this.config.get('JWT_SECRET'));
    }
  });
