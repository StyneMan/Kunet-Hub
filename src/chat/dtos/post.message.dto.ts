import { IsNotEmpty, IsString } from 'class-validator';

export class PostMessageDTO {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
