import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class AddColorDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  code: string;
}
