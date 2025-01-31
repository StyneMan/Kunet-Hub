import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWalletPINDTO {
  @IsNotEmpty()
  @IsString()
  new_pin: string;

  @IsOptional()
  @IsString()
  old_pin?: string;

  @IsOptional()
  @IsString()
  vendor_id?: string;
}
