import { IsNotEmpty, IsString } from 'class-validator';

export class AddSizeDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
