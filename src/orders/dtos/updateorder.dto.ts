import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from 'src/enums/order.status.enum';
import { OrderType } from 'src/enums/order.type.enum';
import OrderItemI from 'src/interfaces/order.item';

export class UpdateOrderDTO {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsArray()
  items?: OrderItemI[];

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  riderId?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  order_status?: OrderStatus;
}
