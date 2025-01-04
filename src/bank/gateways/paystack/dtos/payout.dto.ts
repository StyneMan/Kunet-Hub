import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';

export class PaystackPayoutDTO {
  @IsNotEmpty()
  @IsNumberString()
  account_bank: string;

  @IsNotEmpty()
  @IsNumberString()
  account_number: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  beneficiary_name: string;
}
