import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VariationType } from 'src/enums/variation.type.enum';

export class UpdateVariationDTO {
  @IsOptional()
  @IsString()
  colorId?: string;

  @IsOptional()
  @IsString()
  sizeId?: string;

  @IsOptional()
  @IsEnum(VariationType)
  type?: VariationType;
}
