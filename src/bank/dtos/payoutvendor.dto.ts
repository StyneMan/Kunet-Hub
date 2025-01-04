import { IsNotEmpty, IsString } from 'class-validator';

export class PayoutVendorDTO {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;
}
