import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ResetPasswordAdminDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsStrongPassword()
  confirm_password: string;

  @IsNotEmpty()
  @IsStrongPassword()
  new_password: string;
}
