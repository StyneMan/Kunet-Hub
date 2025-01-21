import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SMSProviderType } from 'src/enums/sms.providers.enum';

export class AddSMSProviderDTO {
  @IsNotEmpty()
  @IsString()
  sender_name: string;

  @IsNotEmpty()
  @IsEnum(SMSProviderType)
  provider: SMSProviderType;

  @IsOptional()
  @IsString()
  sender_id?: string;

  @IsOptional()
  @IsString()
  private_key?: string;

  @IsNotEmpty()
  @IsString()
  public_key: string;
}
