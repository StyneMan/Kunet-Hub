import { IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateColorDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  code?: string;
}
