import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BikeType } from 'src/enums/bike.type.enum';

export class AddBikeDTO {
  @IsOptional()
  @IsString()
  make: string;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  reg_number: string;

  @IsOptional()
  @IsString()
  year_of_manufacture: string;

  @IsNotEmpty()
  @IsEnum(BikeType)
  type: BikeType;

  @IsNotEmpty()
  @IsString()
  colorId: string;
}
