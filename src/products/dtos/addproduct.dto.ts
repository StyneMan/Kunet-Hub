import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Variation } from 'src/entities/variations.entity';

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
  variations?: Variation[];

  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
