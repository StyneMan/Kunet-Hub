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
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { CreateVendorDTO } from './dtos/createvendor.dto';
import { VendorType } from 'src/enums/vendor.type.enum';
import { AddCategoryDTO } from './dtos/addcategory.dto';
import { Request } from 'express';
import { UpdateVendorDTO } from './dtos/updatevendor.dto';
import { AddCouponDTO } from './dtos/add.coupon.dto';
import { UpdateCouponDTO } from './dtos/update.coupon.dto';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';
import { NearbyVendorDTO } from './dtos/nearby.vendor.dto';
import { VendorKYCDTO } from './dtos/vendor.kyc.dto';
import {
  AcceptOrderDTO,
  RejectOrderDTO,
} from 'src/riders/dtos/order.action.dto';
import { AddVendorLocationDTO } from './dtos/add.vendor.location.dto';
import { UpdateVendorLocationDTO } from './dtos/update.vendor.location.dto';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';

@Controller('vendor')
export class VendorsController {
  constructor(private vendorService: VendorsService) {}

  @Get('all')
  async allVendors(
    @Query('type') type: VendorType,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    const resp = await this.vendorService.findVendors(page, limit, type);

    return resp;
  }

  @Get('list')
  async vendorList() {
    return await this.vendorService.vendorList();
  }

  @Post('nearby')
  async nearestVendors(
    @Query('type') type: VendorType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Body() payload: NearbyVendorDTO,
  ) {
    const resp = await this.vendorService.findNearbyVendors(
      page,
      limit,
      payload?.lat,
      payload?.lng,
    );

    return resp;
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
  async createVendor(@Req() req: any, @Body() body: CreateVendorDTO) {
    console.log('CREATE VENDDOR PAYLOAD :: ', body);

    return await this.vendorService.createVendor(req?.user?.sub, body);
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
  async updateVendor(@Req() req: any, @Body() body: UpdateVendorDTO) {
    return await this.vendorService.updateVendor(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
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
  async setupKYC(@Req() req: any, @Body() payload: VendorKYCDTO) {
    return await this.vendorService.completeKYC(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/adminUpdate')
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
  async adminUpdateVendor(@Req() req: any, @Body() body: UpdateVendorDTO) {
    return await this.vendorService.adminUpdateVendor(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('location/create')
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
  async createVendorLocation(
    @Req() req: any,
    @Body() body: AddVendorLocationDTO,
  ) {
    return await this.vendorService.addVendorLocation(req?.user?.sub, body);
  }

  @Get('location/all')
  async locations(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findAllVendorLocations(page, limit);
  }

  @Get('locations')
  async vendorLocations(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 30,
    @Query('type') type: VendorType,
  ) {
    return await this.vendorService.findVendorLocations(page, limit, type);
  }

  @Get(':id/locations')
  async vendorBranches(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 30,
    @Param('id') id: string,
  ) {
    return await this.vendorService.findVendorBranches(page, limit, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('location/:id/update')
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
  async updateLocation(@Req() req: any, @Body() body: UpdateVendorLocationDTO) {
    return await this.vendorService.updateVendorLocation(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('location/:id/delete')
  async deleteLocation(@Req() req: any) {
    return await this.vendorService.deleteVendorLocation(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('category/create')
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
  async createCategory(@Req() req: any, @Body() body: AddCategoryDTO) {
    return await this.vendorService.addCategory(req?.user?.sub, body);
  }

  @Get('category/all')
  async categories(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findAllCategories(page, limit);
  }

  @Get(':id/categories')
  async vendorCategories(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 30,
  ) {
    return await this.vendorService.findVendorCategories(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('category/:id/update')
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
  async updateCategory(@Req() req: any, @Body() body: AddCategoryDTO) {
    return await this.vendorService.updateCategory(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('category/:id/delete')
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
  async deleteCategory(@Req() req: any) {
    return await this.vendorService.deleteCategory(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('coupon/create')
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
  async createCoupon(@Req() req: any, @Body() body: AddCouponDTO) {
    return await this.vendorService.addCoupon(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('coupon/:id/update')
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
  async updateCoupon(@Req() req: any, @Body() body: UpdateCouponDTO) {
    return await this.vendorService.updateCoupon(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('coupon/:id/delete')
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
  async deleteCoupon(@Req() req: any) {
    return await this.vendorService.deleteCoupon(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @Get(':id/coupons')
  async vendorCoupons(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findVendorCoupons(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('transaction/all')
  async transactions(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findAllTransactions(
      page,
      limit,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/transactions')
  async vendorTransactions(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.vendorService.findVendorTransactions(
      page,
      limit,
      req?.params?.id,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:id/transactions')
  async branchTransactions(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.vendorService.findVendorLocationTransactions(
      page,
      limit,
      req?.params?.id,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/staffs')
  async vendorStaffs(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findVendorStaffs(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents/all')
  async documents(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findAllVendorDocuments(page, limit);
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
    return this.vendorService.setWalletPin(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/wallet')
  async getWallet(@Param('id') id: string) {
    return this.vendorService.findVendorWallet(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/accept')
  async acceptOrder(@Body() payload: AcceptOrderDTO, @Req() req: any) {
    return await this.vendorService.acceptOrder(req.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('order/reject')
  async rejectOrder(@Body() payload: RejectOrderDTO, @Req() req: any) {
    return await this.vendorService.rejectOrder(req.user?.sub, payload);
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
    return await this.vendorService.updateBranchFCMToken(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/notifications')
  async vendorNotifications(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findVendorNotifications(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/notifications/read')
  async markAsReadNotifications(@Req() req: any) {
    return await this.vendorService.markAllAsRead(req?.params?.id);
  }
}
