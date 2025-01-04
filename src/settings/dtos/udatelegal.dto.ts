import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLegalDTO {
  @IsNotEmpty()
  @IsString()
  privacy: string;

  @IsNotEmpty()
  @IsString()
  terms: string;
}
