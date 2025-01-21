import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendOTPDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}
