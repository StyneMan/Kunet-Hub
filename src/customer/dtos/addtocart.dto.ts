import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Addon, ProdVariations } from 'src/entities/product.entity';
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
  extras?: SelectionItemI[];

  @IsOptional()
  @IsArray()
  addOns?: Addon[];

  @IsOptional()
  @IsArray()
  variations?: ProdVariations[];

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
  branch_id: string;

  @IsOptional()
  @IsString()
  vendor_note?: string;
}

export class ReorderToCartDTO {
  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @IsNotEmpty()
  @IsArray()
  items: CartItemDTO[];

  @IsNotEmpty()
  @IsString()
  branch_id: string;

  @IsOptional()
  @IsString()
  vendor_note?: string;
}
