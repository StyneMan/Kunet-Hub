import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChatMemberType } from 'src/enums/user.type.enum';

export class FindOrCcreateChatDTO {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsEnum(ChatMemberType)
  senderType: ChatMemberType;

  @IsNotEmpty()
  @IsEnum(ChatMemberType)
  receiverType: ChatMemberType;
}
