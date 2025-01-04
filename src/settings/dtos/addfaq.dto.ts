import { IsNotEmpty, IsString } from 'class-validator';

export class AddFAQDTO {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  answer: string;
}
