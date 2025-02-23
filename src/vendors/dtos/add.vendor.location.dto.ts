import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class AddVendorLocationDTO {
  @IsNotEmpty()
  @IsString()
  branch_name: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsEmail()
  email_address: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  intl_phone_format: string;

  @IsNotEmpty()
  @IsString()
  natl_phone_format: string;

  @IsNotEmpty()
  @IsString()
  iso_code: string;
}
