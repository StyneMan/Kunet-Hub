import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TopupWalletDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  riderId: string;
}
