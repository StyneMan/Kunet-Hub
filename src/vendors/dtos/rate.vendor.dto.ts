import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserType } from 'src/enums/user.type.enum';

export class RateVendorDTO {
  @IsNotEmpty()
  @IsString()
  vendorLocationId: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  reviewerType: UserType;
}
