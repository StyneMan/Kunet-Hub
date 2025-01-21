import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { AdminRoles } from 'src/enums/admin.roles.enum';

export class CreateAdminDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  iso_code: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsEnum(AdminRoles)
  role: AdminRoles;

  @IsNotEmpty()
  @IsEnum(AdminAccess)
  access: AdminAccess;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
