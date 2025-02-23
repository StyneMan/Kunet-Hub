import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Addon,
  Nutrition,
  ProdVariations,
  Specification,
} from 'src/entities/product.entity';

export class AddProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  sale_amount: number;

  @IsNotEmpty()
  @IsNumber()
  discount_amount: number;

  @IsNotEmpty()
  @IsString()
  discount_percent: string;

  @IsNotEmpty()
  @IsArray()
  images: string[];

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  is_variable: boolean;

  @IsOptional()
  @IsArray()
  variations?: ProdVariations[];

  @IsOptional()
  @IsArray()
  specifications?: Specification[];

  @IsOptional()
  @IsArray()
  addons?: Addon[];

  @IsNotEmpty()
  @IsString()
  vendorLocationId: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsObject()
  nutrition?: Nutrition;
}
