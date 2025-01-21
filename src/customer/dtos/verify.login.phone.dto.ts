import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class VerifyLoginPhoneDTO {
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsNumberString()
  code: string;
}
