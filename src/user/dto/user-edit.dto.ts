import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;
}
