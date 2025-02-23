import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { BannerType } from 'src/enums/banner.type.enum';

export class UpdateBannerDTO {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
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

  @IsOptional()
  @IsEnum(BannerType)
  banner_type: BannerType;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
