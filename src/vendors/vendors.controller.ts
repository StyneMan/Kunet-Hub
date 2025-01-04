import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('vendor')
export class VendorsController {
  constructor(private vendorService: VendorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allVendors(
    @Query('type') type: VendorType,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findVendors(page, limit, type);
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
    return await this.vendorService.updateInformation(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
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
    return await this.vendorService.updateVendor(
      req?.user?.sub,
      req?.params?.id,
      body,
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

  @UseGuards(JwtAuthGuard)
  @Get('category/all')
  async categories(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.vendorService.findAllCategories(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/categories')
  async vendorCategories(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
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
  @Delete('category/:id/delete')
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
    return await this.vendorService.findAllDocuments(page, limit);
  }
}
