import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CouponStatus } from 'src/enums/coupon.status.enum';
import { DiscountType } from 'src/enums/discount.type.enum';

export class UpdateCouponDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
