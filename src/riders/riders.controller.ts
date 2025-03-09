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
import { RidersService } from './riders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { CreateRiderDTO } from './dtos/createrider.dto';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';
import { CompleteRiderKYCDTO } from './dtos/rider.kyc.dto';
import { AcceptOrderDTO, RejectOrderDTO } from './dtos/order.action.dto';
import {
  RiderArrivedCustomerDTO,
  RiderArrivedVendorDTO,
} from './dtos/rider.arrived.dto';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';
import { ReviewRiderDTO } from './dtos/review.rider.dto';

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
  @Post('profile/update')
  async updateCustomer(@Req() req: any) {
    return await this.riderService.updateUser(req?.user?.sub, req?.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc/setup')
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
          message: ` ${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async setupKYC(@Req() req: any, @Body() payload: CompleteRiderKYCDTO) {
    return await this.riderService.completeKYC(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/profile')
  async profile(@Req() req: any) {
    return await this.riderService.findCurrentRider(req?.user?.sub);
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
  @Post('fcm/update')
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
  async updateFCMToken(@Req() req: any, @Body() body: UpdateFCMTokenDTO) {
    return await this.riderService.updateFCMToken(req?.user?.sub, body);
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

  @UseGuards(JwtAuthGuard)
  @Put('wallet/secure')
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
  async setWalletPIN(@Body() payload: UpdateWalletPINDTO, @Req() req: any) {
    return this.riderService.setWalletPin(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/wallet')
  async wallet(@Param('id') id: string) {
    return await this.riderService.findRiderWallet(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/transactions')
  async riderTransactions(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('startDate') startDate?: Date | null,
    @Query('endDate') endDate?: Date | null,
    @Query('filterBy') filterBy?: 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    return await this.riderService.riderTransactions(
      page,
      limit,
      id,
      startDate,
      endDate,
      filterBy,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/transactions/withdrawals')
  async riderWithdrawals(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.riderWithdrawals(page, limit, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/orders')
  async riderOrders(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.riderOrders(page, limit, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/orders/active')
  async riderActiveOrders(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.riderService.riderActiveOrders(page, limit, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('set_available')
  async setAvailability(
    @Query('available') available: boolean,
    @Req() req: any,
  ) {
    return await this.riderService.setAvailability(req.user?.sub, available);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/accept')
  async acceptOrder(@Body() payload: AcceptOrderDTO, @Req() req: any) {
    return await this.riderService.acceptOrder(req.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/reject')
  async rejectOrder(@Body() payload: RejectOrderDTO, @Req() req: any) {
    return await this.riderService.rejectOrder(req.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/arrived/vendor')
  async arrivedVendor(@Body() payload: RiderArrivedVendorDTO, @Req() req: any) {
    return await this.riderService.setHasArrivedVendor(req.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/arrived/customer')
  async arrivedCustomer(
    @Body() payload: RiderArrivedCustomerDTO,
    @Req() req: any,
  ) {
    return await this.riderService.setHasArrivedCustomer(
      req.user?.sub,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/review')
  async reviewRider(@Body() payload: ReviewRiderDTO, @Param('id') id: string) {
    return await this.riderService.reviewRider(id, payload);
  }
}
