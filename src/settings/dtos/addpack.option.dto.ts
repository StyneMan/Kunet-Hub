import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddPackOptionDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  cost: number;
}
