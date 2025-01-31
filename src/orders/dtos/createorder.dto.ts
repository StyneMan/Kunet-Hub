import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReceiverI } from 'src/commons/interfaces/receiver.interface';
import { DeliveryType } from 'src/enums/delivery.type.enum';
import { OrderType } from 'src/enums/order.type.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { ShippingType } from 'src/enums/shipping.type.enum';
import OrderItemI from 'src/interfaces/order.item';

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsArray()
  items: OrderItemI[];

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  riderNote?: string;

  @IsOptional()
  @IsString()
  vendorNote?: string;

  @IsNotEmpty()
  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNotEmpty()
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @IsOptional()
  @IsEnum(ShippingType)
  shippingType?: ShippingType;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNumber()
  deliveryFee: number;

  @IsOptional()
  @IsNumber()
  deliveryTime: string;

  @IsOptional()
  @IsNumber()
  riderCommission?: number;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsNumberString()
  deliveryAddrLat?: string;

  @IsOptional()
  @IsNumberString()
  deliveryAddrLng?: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsNumberString()
  pickupAddrLat?: string;

  @IsOptional()
  @IsNumberString()
  pickupAddrLng?: string;

  @IsOptional()
  @IsObject()
  receiver?: ReceiverI;
}
