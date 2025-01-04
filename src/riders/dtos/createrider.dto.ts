import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { IdentityType } from 'src/enums/identity.type.enum';

export class CreateRiderDTO {
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
  iso_code: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsEnum(IdentityType)
  identity_type: IdentityType;

  @IsNotEmpty()
  @IsString()
  identity_number: string;

  @IsNotEmpty()
  @IsUrl()
  front_view: string;

  @IsUrl()
  @IsOptional()
  back_view: string;

  @IsNotEmpty()
  @IsString()
  zoneId: string;
}
