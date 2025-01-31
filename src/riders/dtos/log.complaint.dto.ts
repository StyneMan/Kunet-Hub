import { IsAlpha, IsNotEmpty, IsString } from 'class-validator';

export class LogComplaintDTO {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  reporteeId: string;
}
