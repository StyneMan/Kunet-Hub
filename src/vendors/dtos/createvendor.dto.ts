import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsAlpha,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  Matches,
} from 'class-validator';
import { IdentityType } from 'src/enums/identity.type.enum';
import { VendorType } from 'src/enums/vendor.type.enum';

export class CreateVendorDTO {
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
  identity_number: string;

  @IsNotEmpty()
  @IsEnum(IdentityType)
  identity_type: IdentityType;

  @IsNotEmpty()
  @IsUrl()
  front_view: string;

  @IsNotEmpty()
  @IsUrl()
  back_view: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'name must contain only alphabets and spaces',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  regNo: string;

  @IsOptional()
  @IsUrl()
  website?: string;

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
  @IsEnum(VendorType)
  type: VendorType;

  @IsNotEmpty()
  @IsUrl()
  biz_cert: string;

  @IsNotEmpty()
  @IsString()
  zoneId: string;
}
