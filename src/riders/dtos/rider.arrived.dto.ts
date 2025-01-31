import { IsNotEmpty, IsString } from 'class-validator';

export class RiderArrivedVendorDTO {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

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
