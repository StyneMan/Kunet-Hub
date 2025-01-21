import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom validator to check for WKT format
@ValidatorConstraint({ name: 'isValidWKT', async: false })
export class IsValidWKT implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments): boolean {
    // Simple regex to validate WKT format (POINT, LINESTRING, POLYGON, etc.)
    console.log(args);

    const wktRegex =
      /^(POINT|LINESTRING|POLYGON|MULTIPOLYGON|MULTILINESTRING|MULTIPOINT)\s*\(.*\)$/i;
    return wktRegex.test(text);
  }

  defaultMessage(args: ValidationArguments): string {
    console.log(args);
    return 'boundary must be a valid WKT string (e.g., POINT(1 1), POLYGON((...))).';
  }
}

export class AddZoneDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsValidWKT, {
    message: 'Invalid GIS data. The boundary field must be in WKT format.',
  })
  boundary: string;
}
