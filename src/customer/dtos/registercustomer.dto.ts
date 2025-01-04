import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsOptional,
  IsObject,
} from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class RegisterCustomerDTO {
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
  @IsStrongPassword()
  password: string;

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

  @IsOptional()
  @IsObject()
  address?: any;
}

export class CreateCustomerGoogleDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsString()
  photo: string;

  @IsOptional()
  @IsObject()
  address?: any;
}
