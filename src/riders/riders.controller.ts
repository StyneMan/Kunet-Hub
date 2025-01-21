import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { CreateRiderDTO } from './dtos/createrider.dto';

@Controller('rider')
export class RidersController {
  constructor(private riderService: RidersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allRiders(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.findRidersPaged(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
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
  async addRider(@Req() req: any, @Body() body: CreateRiderDTO) {
    return await this.riderService.createRider(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/suspend')
  async suspendRider(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.riderService.suspendRider(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pardon')
  async pardonRider(@Req() req: any) {
    return await this.riderService.pardonRider(req?.user?.sub, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
  async updateRider(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.riderService.updateUser(req?.params?.id, req?.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transaction/all')
  async transactions(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.findAllTransactions(
      page,
      limit,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents/all')
  async documents(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.findAllDocuments(page, limit);
  }
}
