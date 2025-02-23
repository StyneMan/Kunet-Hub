import {
  IsArray,
  IsBoolean,
  IsEnum,
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
import { ProductStatus } from 'src/enums/product.status.enum';

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  sale_amount?: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  discount_percent?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsBoolean()
  is_variable?: boolean;

  @IsOptional()
  @IsArray()
  variations?: ProdVariations[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  specifications?: Specification[];

  @IsOptional()
  @IsArray()
  addons?: Addon[];

  @IsOptional()
  @IsObject()
  nutrition?: Nutrition;
}
