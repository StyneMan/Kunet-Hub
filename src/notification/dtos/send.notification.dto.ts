import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PushNotificationType } from 'src/enums/push.notification.type.enum';

export class SendNotificationDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(PushNotificationType)
  notificatioonType: PushNotificationType;

  @IsOptional()
  @IsString()
  itemId?: string;
}
