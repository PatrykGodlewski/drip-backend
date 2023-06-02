import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class SendPasswordResetCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class VerifyPasswordResetCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;
}
export class ResetPasswordDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
