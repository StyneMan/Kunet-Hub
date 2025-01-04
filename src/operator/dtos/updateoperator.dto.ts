import {
  IsAlpha,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { UserStatus } from 'src/enums/user.status.enum';
// import { Address } from 'src/typeorm/entities/address';

export class UpdateOperatorDTO {
  @IsOptional()
  @IsString()
  @IsAlpha()
  first_name?: string;

  @IsOptional()
  @IsString()
  @IsAlpha()
  last_name?: string;

  @IsOptional()
  @IsString()
  @IsAlpha()
  middle_name?: string;

  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  is_kyc_completed?: boolean;

  @IsOptional()
  kyc_completed_at?: any;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  intl_phone_format?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  iso_code?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  @IsAlpha()
  state?: string;

  @IsOptional()
  @IsString()
  @IsAlpha()
  city?: string;

  @IsOptional()
  @IsString()
  @IsAlpha()
  street?: string;

  @IsOptional()
  last_login?: any;

  @IsOptional()
  next_login?: any;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;
}
