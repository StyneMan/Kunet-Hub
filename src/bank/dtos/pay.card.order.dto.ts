import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FlutterwavePaymentLinkDTO } from './flutterwave.payment.dto';
import { CreateOrderDTO } from 'src/orders/dtos/createorder.dto';
import { UserType } from 'src/enums/user.type.enum';

export class PayCardOrderDTO {
  @IsNotEmpty()
  paymentInfo: FlutterwavePaymentLinkDTO;

  @IsNotEmpty()
  orderInfo: CreateOrderDTO;

  @IsNotEmpty()
  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  couponId?: string;
}

export class PayWalletOrderDTO {
  @IsNotEmpty()
  @IsString()
  wallet_pin: string;

  @IsNotEmpty()
  orderInfo: CreateOrderDTO;

  @IsNotEmpty()
  paymentInfo: FlutterwavePaymentLinkDTO;

  @IsNotEmpty()
  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  couponId?: string;
}
