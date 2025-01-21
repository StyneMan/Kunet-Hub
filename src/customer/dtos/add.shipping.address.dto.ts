import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressCategory } from 'src/enums/address.category.enum';

export class AddShippingAddressDTO {
  @IsNotEmpty()
  @IsString()
  locality: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: string;

  @IsNotEmpty()
  @IsNumber()
  longitude: string;

  @IsNotEmpty()
  @IsEnum(AddressCategory)
  addressAs: AddressCategory;
}
