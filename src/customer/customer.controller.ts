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
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { CreateCustomerDTO } from './dtos/createcustomer.dto';
import { ValidationError } from 'class-validator';
import { AddShippingAddressDTO } from './dtos/add.shipping.address.dto';
import { UpdateShippingAddressDTO } from './dtos/update.shipping.address.dto';
import { VendorType } from 'src/enums/vendor.type.enum';
import { AddToCartDTO } from './dtos/addtocart.dto';

@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allCustomers(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.customerService.findCustomers(page, limit);
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
  async addCustomer(@Req() req: any, @Body() body: CreateCustomerDTO) {
    return await this.customerService.addCustomer(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/suspend')
  async suspendCustomer(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.customerService.suspendCustomer(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pardon')
  async pardonCustomer(@Req() req: any) {
    return await this.customerService.pardonCustomer(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/update')
  async updateCustomer(@Req() req: any) {
    return await this.customerService.updateCustomer(req?.user?.sub, req?.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/profile')
  async profile(@Req() req: any) {
    return await this.customerService.findCurrentCustomer(req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('address/add')
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
  async saveAddress(@Body() payload: AddShippingAddressDTO, @Req() req: any) {
    return this.customerService.addShippingAddress(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('address/all')
  async customerShippingAddresses(@Req() req: any) {
    return this.customerService.customerShippingAddresses(req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('address/:id/update')
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
  async updateShippingAddress(
    @Body() payload: UpdateShippingAddressDTO,
    @Req() req: any,
  ) {
    return this.customerService.updateShippingAddress(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('address/:id/setDefault')
  async setDefaultShippingAddress(@Req() req: any) {
    return this.customerService.setDefaultShippingAddress(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('address/:id/delete')
  async deleteShippingAddress(@Req() req: any, @Param('id') id: string) {
    return this.customerService.deleteShippingAddress(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('vendor/:id/favourite')
  async likeUnlike(@Req() req: any, @Param('id') id: string) {
    return this.customerService.likeUnlikeVendor(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/favourites')
  async favourites(
    @Param('id') id: string,
    @Query('type') type?: VendorType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.customerService.customerFavourites(page, limit, id, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/favourite/list')
  async favouriteList(@Param('id') id: string) {
    return await this.customerService.allfavsIds(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart/add')
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
  async addToCart(@Body() payload: AddToCartDTO, @Req() req: any) {
    return this.customerService.addToCart(req?.user?.sub, payload);
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id/carts')
  async customerCarts(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.customerService.customerCarts(page, limit, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart/:id/delete')
  async deleteCart(@Param('id') id: string) {
    return await this.customerService.deleteCart(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart/item/:id/delete')
  async deleteCartItem(@Req() req: any) {
    return await this.customerService.deleteCartItem(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/wallet')
  async wallet(@Param('id') id: string) {
    return await this.customerService.customerWallet(id);
  }
}
