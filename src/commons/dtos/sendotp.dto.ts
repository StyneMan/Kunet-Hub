import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOTPDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;
}
