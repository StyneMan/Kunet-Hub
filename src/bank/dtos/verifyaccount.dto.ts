import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class VerifyAccountDTO {
  @IsNotEmpty()
  @IsNumberString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  bankCode: string;
}
