import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;
}
