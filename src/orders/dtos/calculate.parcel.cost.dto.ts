import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ShippingType } from 'src/enums/shipping.type.enum';

export class CalculateParcelCostDTO {
  @IsNotEmpty()
  @IsNumber()
  totalWeight: number;

  @IsNotEmpty()
  @IsNumber()
  senderLat: number;

  @IsNotEmpty()
  @IsNumber()
  senderLng: number;

  @IsNotEmpty()
  @IsNumber()
  receiverLat: number;

  @IsNotEmpty()
  @IsNumber()
  receiverLng: number;

  @IsNotEmpty()
  @IsEnum(ShippingType)
  shippingType: ShippingType;
}
