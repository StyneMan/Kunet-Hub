import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginPhoneDTO {
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  intl_phone_number: string;
}
