import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFCMTokenDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}
