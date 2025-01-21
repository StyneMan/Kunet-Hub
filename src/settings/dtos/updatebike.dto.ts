import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BikeType } from 'src/enums/bike.type.enum';

export class UpdateBikeDTO {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  reg_number?: string;

  @IsOptional()
  @IsString()
  year_of_manufacture?: string;

  @IsOptional()
  @IsEnum(BikeType)
  type?: BikeType;

  @IsOptional()
  @IsString()
  colorId?: string;
}
