import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginAdminDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
