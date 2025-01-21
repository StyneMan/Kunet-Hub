import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateParcelOrderDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;
}
