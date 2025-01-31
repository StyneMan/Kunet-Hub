import {
  IsAlpha,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CompleteRiderKYCDTO {
  @IsNotEmpty()
  @IsAlpha()
  first_name: string;

  @IsNotEmpty()
  @IsAlpha()
  last_name: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  zoneId: string;

  @IsNotEmpty()
  @IsUrl()
  photo_url: string;
}
