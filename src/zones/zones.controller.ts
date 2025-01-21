import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ZonesService } from './zones.service';
import { AddZoneDTO } from './dtos/addzone.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';

@Controller('zone')
export class ZonesController {
  constructor(private readonly zoneService: ZonesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorField}: ${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async create(@Body() payload: AddZoneDTO, @Req() req: any) {
    return this.zoneService.addZone(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allPaged(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.zoneService.all(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all_zones')
  async all() {
    return await this.zoneService.allZone();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorField}: ${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async update(@Body() payload: AddZoneDTO, @Req() req: any) {
    return this.zoneService.updateZone(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorField}: ${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async delete(@Req() req: any) {
    return this.zoneService.deleteZone(req?.user?.sub, req?.params?.id);
  }
}
