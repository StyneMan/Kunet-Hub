import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCartDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
