import {
  IsAlphanumeric,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { DiscountType } from 'src/enums/discount.type.enum';

export class AddCouponDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  code: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNotEmpty()
  @IsDateString()
  expires_at: Date;
}
