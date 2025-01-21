import { IsOptional, IsString } from 'class-validator';

export class UpdateSizeDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  value?: string;
}
