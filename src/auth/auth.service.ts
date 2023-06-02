import { MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailer: MailerService,
  ) {}

  async signin(body: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Email or password is incorrect');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Email is not verified');
    }

    const passwordMatch = await argon.verify(user.hashedPassword, body.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Email or password is incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async signup(body: AuthDto) {
    const passwordHash = await argon.hash(body.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          hashedPassword: passwordHash,
        },
      });
      await this.sendVerificationEmail(user.id, user.email, user.username);
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      throw error;
    }
  }

  async sendVerificationEmail(userId: number, email: string, username: string) {
    const token = await this.signToken(userId, email);
    const url = `${this.config.get('CLIENT_URL')}/auth/confirm?token=${token.access_token}`;
    await this.mailer.sendMail({
      to: email,
      subject: 'Account confirmation',
      html: `
          <h3>Hello ${username}!
          <p>Please use this <a href="${url}">link</a> to confirm your account.</p>
      `,
    });
  }

  async verifyToken(token: string) {
    const secret = this.config.get('JWT_SECRET');
    const verifiedToken = await this.jwt.verify(token, { secret });
    return verifiedToken;
  }

  async confirm(token: string) {
    const verifiedToken = await this.verifyToken(token);
    console.log(verifiedToken);
    const user = await this.prisma.user.findUnique({
      where: {
        id: verifiedToken.sub,
      },
    });
    if (!user) {
      throw new ForbiddenException('Invalid token');
    }
    const verifiedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });
    return { isVerified: verifiedUser.isVerified };
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      }),
    };
  }

  async sendResetPasswordCode(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Email does not exist');
    }

    const randCode = Math.floor(Math.random() * 1000000 - 1);
    await this.prisma.resetPasswordCode.deleteMany({
      where: {
        userId: user.id,
      },
    });
    const code = await this.prisma.resetPasswordCode.create({
      data: {
        code: randCode.toString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await this.mailer.sendMail({
      to: email,
      subject: 'Password Reset Code',
      html: `Code: <strong>${code.code}</strong>`,
    });
  }

  async verifyResetPasswordCode(email: string, code: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    const resetCode = await this.prisma.resetPasswordCode.findFirst({
      where: {
        code: code.toString(),
        userId: user.id,
      },
    });
    if (!resetCode) {
      throw new ForbiddenException('Code is invalid');
    }
    if (resetCode.expiresAt < new Date()) {
      throw new ForbiddenException('Code has expired');
    }
    return resetCode;
  }

  async resetPassword(newPassword: string, email: string) {
    const user = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        hashedPassword: await argon.hash(newPassword),
      },
    });

    return this.signToken(user.id, user.email);
  }
}
