import {
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { OperatorRole, OperatorType } from 'src/enums/operator.type.enum';
// import { Address } from 'src/typeorm/entities/address';

export class CreateOperatorDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  intl_phone_format: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsNotEmpty()
  @IsString()
  iso_code: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsString()
  vendor_location: string;

  @IsNotEmpty()
  @IsEnum(OperatorType)
  operator_type: OperatorType;

  @IsNotEmpty()
  @IsEnum(OperatorRole)
  operator_role: OperatorRole;
}
