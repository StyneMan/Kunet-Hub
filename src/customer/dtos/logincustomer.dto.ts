import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginCustomerDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
