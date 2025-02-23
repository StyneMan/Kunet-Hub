import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

class BusinessSchedule {
  @IsNotEmpty()
  @IsString()
  mon_open: string;

  @IsNotEmpty()
  @IsString()
  mon_close: string;

  @IsNotEmpty()
  @IsString()
  tue_open: string;

  @IsNotEmpty()
  @IsString()
  tue_close: string;

  @IsNotEmpty()
  @IsString()
  wed_open: string;

  @IsNotEmpty()
  @IsString()
  wed_close: string;

  @IsNotEmpty()
  @IsString()
  thu_open: string;

  @IsNotEmpty()
  @IsString()
  thu_close: string;

  @IsNotEmpty()
  @IsString()
  fri_open: string;

  @IsNotEmpty()
  @IsString()
  fri_close: string;

  @IsNotEmpty()
  @IsString()
  sat_open: string;

  @IsNotEmpty()
  @IsString()
  sat_close: string;

  @IsNotEmpty()
  @IsString()
  sun_open: string;

  @IsNotEmpty()
  @IsString()
  sun_close: string;
}

export class VendorKYCDTO {
  @IsNotEmpty()
  business_schedule: BusinessSchedule;

  @IsNotEmpty()
  @IsString()
  business_phone: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  intl_phone_format: string;

  @IsNotEmpty()
  @IsString()
  iso_code: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsEmail()
  business_email: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  about: string;

  @IsNotEmpty()
  @IsUrl()
  cover: string;
}
