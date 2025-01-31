import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplyCouponCodeDTO {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsNumber()
  total_amount: number;
}
