import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestPayoutDTO {
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsNotEmpty()
  @IsString()
  walletPin: string;
}
