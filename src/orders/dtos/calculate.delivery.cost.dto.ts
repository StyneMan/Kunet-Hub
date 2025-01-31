import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CalculateDeliveryCostDTO {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;
}
