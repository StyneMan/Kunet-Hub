import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RiderArrivedVendorDTO {
  @IsOptional()
  @IsString()
  vendorLocationId?: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class RiderArrivedCustomerDTO {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
