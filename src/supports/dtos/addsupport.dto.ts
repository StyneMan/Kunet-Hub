import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SupportType } from 'src/enums/support.type.enum';

export class AddSupportDTO {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEnum(SupportType)
  support_type: SupportType;
}
