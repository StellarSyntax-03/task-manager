import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'member'])
  role?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
