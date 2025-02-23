import { IsNotEmpty, IsNumberString } from 'class-validator';

export class NearbyVendorDTO {
  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @IsNumberString()
  @IsNotEmpty()
  lng: string;
}
