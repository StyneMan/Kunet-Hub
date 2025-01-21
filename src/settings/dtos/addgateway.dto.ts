import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PaymentGatewayType } from 'src/enums/payment.gateways.enum';

export class AddGatewayDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PaymentGatewayType)
  provider: PaymentGatewayType;

  @IsNotEmpty()
  @IsUrl()
  logo: string;

  @IsNotEmpty()
  @IsString()
  private_key: string;

  @IsNotEmpty()
  @IsString()
  public_key: string;

  @IsOptional()
  @IsString()
  encryption?: string;
}
