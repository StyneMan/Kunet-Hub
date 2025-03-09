import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupportsService } from './supports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { AddSupportDTO } from './dtos/addsupport.dto';
import { UpdateSupportDTO } from './dtos/updatesupport.dto';
import { SupportType } from 'src/enums/support.type.enum';

@Controller('supports')
export class SupportsController {
  constructor(private readonly supportService: SupportsService) {}

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
  async addSupport(@Body() payload: AddSupportDTO) {
    return this.supportService.addSupport(payload);
  }

  @Get('/all')
  async allSupport(
    @Query('type') type?: SupportType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.supportService.all(page, limit, type);
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
  async updateSupport(
    @Body() payload: UpdateSupportDTO,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.supportService.updateSupport(req?.user?.sub, id, payload);
  }
}
