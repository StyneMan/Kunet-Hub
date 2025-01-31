import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserType } from 'src/enums/user.type.enum';

export class ReviewRiderDTO {
  @IsString()
  @IsNotEmpty()
  reviewer_id: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  user_type: UserType;

  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
