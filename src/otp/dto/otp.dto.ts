import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OTPPayloadDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
