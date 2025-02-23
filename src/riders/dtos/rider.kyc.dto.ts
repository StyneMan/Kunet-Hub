import {
  IsAlpha,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { BikeType } from 'src/enums/bike.type.enum';

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
  @IsEnum(BikeType)
  bikeType: BikeType;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsNotEmpty()
  @IsUrl()
  photo_url: string;
}
