import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { BannerType } from 'src/enums/banner.type.enum';

export class AddBannerDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsUrl()
  external_link?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  vendorLocationId?: string;

  @IsNotEmpty()
  @IsEnum(BannerType)
  banner_type: BannerType;
}
