import { IsNotEmpty, IsString } from 'class-validator';

export class AddCategoryDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;
}
