import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async signin(body: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Email or password is incorrect');
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
          email: body.email,
          hashedPassword: passwordHash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      throw error;
    }
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
}
