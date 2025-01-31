import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AcceptOrderDTO {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class RejectOrderDTO {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class CustomerUnavailableDTO {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsArray()
  imageProofs: string[];

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
