import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SMSProviderType } from 'src/enums/sms.providers.enum';

export class UpdateSMSProviderDTO {
  @IsOptional()
  @IsString()
  sender_name?: string;

  @IsOptional()
  @IsEnum(SMSProviderType)
  provider?: SMSProviderType;

  @IsOptional()
  @IsString()
  sender_id?: string;

  @IsOptional()
  @IsString()
  private_key?: string;

  @IsOptional()
  @IsString()
  public_key?: string;
}
