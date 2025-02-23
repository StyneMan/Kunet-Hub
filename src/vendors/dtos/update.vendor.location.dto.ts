import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateVendorLocationDTO {
  @IsOptional()
  @IsString()
  branch_name?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsEmail()
  email_address?: string;

  @IsOptional()
  @IsPhoneNumber()
  intl_phone_format?: string;

  @IsOptional()
  @IsString()
  natl_phone_format?: string;

  @IsOptional()
  @IsString()
  isso_code?: string;
}
