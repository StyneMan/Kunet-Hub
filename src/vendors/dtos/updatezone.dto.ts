import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateZoneDTO {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  boundary: string;
}
