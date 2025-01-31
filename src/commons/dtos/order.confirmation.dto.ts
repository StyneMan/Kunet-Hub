import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeliveryType } from 'src/enums/delivery.type.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import OrderItemI from 'src/interfaces/order.item';

export class OrderConfirmationEmailDTO {
  @IsNotEmpty()
  @IsString()
  orderNum: string;

  @IsNotEmpty()
  @IsString()
  orderDate: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  amountPaid: number;

  @IsNotEmpty()
  @IsArray()
  items: OrderItemI[];

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsNumber()
  serviceCharge: number;

  @IsNotEmpty()
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsNotEmpty()
  @IsString()
  vendorName: string;
}
