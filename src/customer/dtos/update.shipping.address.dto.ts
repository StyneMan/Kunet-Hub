import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressCategory } from 'src/enums/address.category.enum';

export class UpdateShippingAddressDTO {
  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsNumber()
  latitude?: string;

  @IsOptional()
  @IsNumber()
  longitude?: string;

  @IsOptional()
  @IsEnum(AddressCategory)
  addressAs?: AddressCategory;
}
