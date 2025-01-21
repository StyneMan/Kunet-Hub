import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { PaymentGatewayType } from 'src/enums/payment.gateways.enum';

export class UpdateGatewayDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PaymentGatewayType)
  provider?: PaymentGatewayType;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsString()
  private_key?: string;

  @IsOptional()
  @IsString()
  public_key?: string;

  @IsOptional()
  @IsString()
  encryption?: string;
}
