import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
