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
import { OperatorService } from './operator.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { CreateOperatorDTO } from './dtos/createoperator.dto';
import { ValidationError } from 'class-validator';
import { UpdateOperatorDTO } from './dtos/updateoperator.dto';
import { Request } from 'express';

@Controller('operator')
export class OperatorController {
  constructor(private operatorService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allOperators(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.operatorService.findOperatorsPaged(page, limit);
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
  async addStaff(@Req() req: any, @Body() body: CreateOperatorDTO) {
    return await this.operatorService.createOperator(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/profile')
  async profile(@Req() req: any) {
    return await this.operatorService.findCurrentOperator(req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/update')
  async updateProfile(@Req() req: any, @Body() payload: UpdateOperatorDTO) {
    return await this.operatorService.updateOperator(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update')
  async updateOperator(
    @Req() req: Request,
    @Body() payload: UpdateOperatorDTO,
  ) {
    return await this.operatorService.updateOperator(req?.params?.id, payload);
  }
}
