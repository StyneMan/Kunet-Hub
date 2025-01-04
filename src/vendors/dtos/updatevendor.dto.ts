import {
  IsString,
  IsEnum,
  IsOptional,
  IsAlpha,
  IsUrl,
  IsArray,
} from 'class-validator';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { VendorType } from 'src/enums/vendor.type.enum';

export class UpdateVendorDTO {
  @IsOptional()
  @IsString()
  @IsAlpha()
  name?: string;

  @IsOptional()
  @IsString()
  slogan?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  cover?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsArray()
  staffs?: string[];

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  zoneId?: string;

  @IsOptional()
  business_schedule?: any;

  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;
}
