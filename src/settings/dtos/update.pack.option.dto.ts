import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackOptionDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;
}
