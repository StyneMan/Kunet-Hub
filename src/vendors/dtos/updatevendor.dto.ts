import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { VendorType } from 'src/enums/vendor.type.enum';

export class UpdateVendorDTO {
  @IsOptional()
  @IsString()
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
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  zoneId?: string;

  @IsOptional()
  business_schedule?: any;

  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;
}
