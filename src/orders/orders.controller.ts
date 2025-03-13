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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { OrderType } from 'src/enums/order.type.enum';
import { ValidationError } from 'class-validator';
// import { CreateOrderDTO } from './dtos/createorder.dto';
// import { UserType } from 'src/enums/user.type.enum';
import { Request } from 'express';
import { OrderStatus } from 'src/enums/order.status.enum';
import { CalculateParcelCostDTO } from './dtos/calculate.parcel.cost.dto';
import { CalculateDeliveryCostDTO } from './dtos/calculate.delivery.cost.dto';

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
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return await this.orderService.findOrder(id);
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
  @Post('delivery/estimate')
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
  async estimateDelivery(
    @Req() req: any,
    @Body() body: CalculateDeliveryCostDTO,
  ) {
    return await this.orderService.calculateDeliveryCost(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/all')
  async vendorOrders(
    @Req() req: Request,
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.vendorOrders(
      req?.params?.id,
      page,
      limit,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:id/all')
  async branchOrders(
    @Req() req: Request,
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.branchOrders(
      req?.params?.id,
      page,
      limit,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/accepted')
  async vendorAcceptedOrders(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.orderService.vendorAcceptedOrders(
      req?.params?.id,
      page,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/analytics/sales')
  async vendorSales(
    @Req() req: Request,
    @Query('range') range?: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.orderService.getSalesByVendor(req?.params?.id, range);
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:id/analytics/sales')
  async branchSales(
    @Req() req: Request,
    @Query('range') range?: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.orderService.getSalesByLocation(req?.params?.id, range);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/sales/weekly')
  async getVendorWeeklySales(@Req() req: Request) {
    return await this.orderService.getWeeklySales(req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:id/sales/weekly')
  async getBranchWeeklySales(@Req() req: Request) {
    return await this.orderService.getBranchWeeklySales(req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status/update')
  async updateOrderStatus(
    @Req() req: Request,
    @Query('status') status: OrderStatus,
  ) {
    return await this.orderService.updateOrderStatus(req?.params?.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/reassign')
  async reassignOrder(@Param('id') id: string) {
    return await this.orderService.matchOrderToRider(id);
  }
}
