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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { OrderType } from 'src/enums/order.type.enum';
import { ValidationError } from 'class-validator';
import { CreateOrderDTO } from './dtos/createorder.dto';
import { UserType } from 'src/enums/user.type.enum';
import { Request } from 'express';
import { OrderStatus } from 'src/enums/order.status.enum';
import { CalculateParcelCostDTO } from './dtos/calculate.parcel.cost.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allOrders(
    @Query('type') type?: OrderType,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.all(page, limit, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all/status')
  async allbyStatus(
    @Query('status') status: OrderStatus,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.ordersByStatus(status, page, limit);
  }

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
  async createOrder(
    @Req() req: any,
    @Body() body: CreateOrderDTO,
    @Query('user_type') user_type: UserType = UserType.CUSTOMER,
  ) {
    return await this.orderService.createOrder(req?.user?.sub, user_type, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logistics/estimate')
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
  async estimateParcelDelivery(
    @Req() req: any,
    @Body() body: CalculateParcelCostDTO,
  ) {
    return await this.orderService.calculateParcelDeliveryCost(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/all')
  async vendorOrders(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.vendorOrders(req?.params?.id, page, limit);
  }
}
