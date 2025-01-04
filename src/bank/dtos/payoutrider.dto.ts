import { IsNotEmpty, IsString } from 'class-validator';

export class PayoutRiderDTO {
  @IsNotEmpty()
  @IsString()
  riderId: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;
}
