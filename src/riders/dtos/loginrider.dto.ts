import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRiderDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
