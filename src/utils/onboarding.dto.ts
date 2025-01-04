import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Vendor } from 'src/entities/vendor.entity';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { OperatorType } from 'src/enums/operator.type.enum';
import { UserType } from 'src/enums/user.type.enum';
// import { Address } from 'src/typeorm/entities/address';

export class OnboardingDTO {
  @IsOptional()
  @IsString()
  access?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsOptional()
  @IsEnum(AdminRoles)
  role?: AdminRoles;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  vendor?: Vendor;

  @IsOptional()
  @IsEnum(OperatorType)
  operator_type?: OperatorType;
}
