import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';
import { UserType } from 'src/enums/user.type.enum';

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

  @IsNotEmpty()
  @IsEnum(UserType)
  user_type: UserType;
}
