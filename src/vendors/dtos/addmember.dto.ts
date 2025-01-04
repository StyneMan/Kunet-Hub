import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class AddVendorOperatorDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
