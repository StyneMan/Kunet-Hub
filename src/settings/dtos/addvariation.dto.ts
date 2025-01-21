import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VariationType } from 'src/enums/variation.type.enum';

export class AddVariationDTO {
  @IsOptional()
  @IsString()
  colorId?: string;

  @IsOptional()
  @IsString()
  sizeId?: string;

  @IsNotEmpty()
  @IsEnum(VariationType)
  type: VariationType;
}
