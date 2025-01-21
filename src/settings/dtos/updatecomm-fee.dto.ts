import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateCommissionAndFeeDTO {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  rider_order_cancellation?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  vendor_order_cancellation?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  service_charge?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rider_withdrawal_fee?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  vendor_withdrawal_fee?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rider_commission_per_km?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  delivery_charge_per_km?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  delivery_charge_per_kg?: number;
}
