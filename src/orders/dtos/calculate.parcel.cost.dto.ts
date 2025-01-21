import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShippingType } from 'src/enums/shipping.type.enum';

export class CalculateParcelCostDTO {
  @IsNotEmpty()
  @IsNumber()
  totalWeight: number;

  @IsOptional()
  @IsString()
  senderAddress: string;

  @IsOptional()
  @IsString()
  receiverAddress: string;

  @IsNotEmpty()
  @IsEnum(ShippingType)
  shippingType: ShippingType;
}
