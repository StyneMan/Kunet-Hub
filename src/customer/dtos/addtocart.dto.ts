import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import SelectionItemI from 'src/interfaces/selection.item';

export class CartItemDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsOptional()
  @IsArray()
  selections?: SelectionItemI[];

  @IsNotEmpty()
  @IsNumber()
  total_amount: number;
}

export class AddToCartDTO {
  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @IsNotEmpty()
  item: CartItemDTO;

  @IsNotEmpty()
  @IsString()
  vendor_id: string;

  @IsOptional()
  @IsString()
  vendor_note?: string;
}
