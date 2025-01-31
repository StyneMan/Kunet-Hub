import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCartDTO {
  @IsNotEmpty()
  @IsString()
  vendor_note: string;
}
