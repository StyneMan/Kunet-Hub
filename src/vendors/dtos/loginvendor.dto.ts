import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginCustomerDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
