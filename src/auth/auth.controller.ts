import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, ResetPasswordDto, SendPasswordResetCodeDto, VerifyPasswordResetCodeDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() body: AuthDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() body: AuthDto) {
    return this.authService.signin(body);
  }

  @Post('send-reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  sendResetPassword(@Body() body: SendPasswordResetCodeDto) {
    return this.authService.sendResetPasswordCode(body.email);
  }
  @Post('verify-reset-password')
  @HttpCode(HttpStatus.OK)
  async verifyResetPassword(@Body() body: VerifyPasswordResetCodeDto) {
    const { expiresAt } = await this.authService.verifyResetPasswordCode(body.email, body.code);
    return { message: 'Code is valid', expiresAt };
  }
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: ResetPasswordDto) {
    const { email, password } = body;
    return this.authService.resetPassword(password, email);
  }

  @Get('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Query('token') token: string) {
    return this.authService.confirm(token);
  }
}
