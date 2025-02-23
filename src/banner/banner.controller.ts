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
  ValidationPipe,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { AddBannerDTO } from './dtos/add.banner.dto';
import { UpdateBannerDTO } from './dtos/update.banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private service: BannerService) {}

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
        // const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async createBanner(@Req() req: any, @Body() body: AddBannerDTO) {
    console.log('CREATE BANNER PAYLOAD :: ', body);

    return await this.service.addBanner(req?.user?.sub, body);
  }

  @Get('all')
  async allBanners(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.service.allBanners(page, limit);
  }

  @Get('published')
  async allPublishedBanners(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.service.publishedBanners(page, limit);
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
  async updateBanner(@Req() req: any, @Body() body: UpdateBannerDTO) {
    return await this.service.updateBanner(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
  async deleteBanner(@Req() req: any) {
    return await this.service.deleteBanner(req?.user?.sub, req?.params?.id);
  }
}
