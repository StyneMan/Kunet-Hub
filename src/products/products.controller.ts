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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { AddProductDTO } from './dtos/addproduct.dto';
import { Request } from 'express';
import { UpdateProductDTO } from './dtos/updateproduct.dto';
import { VendorType } from 'src/enums/vendor.type.enum';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Get('all')
  async all(
    @Query('type') type: VendorType,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.productService.findProducts(page, limit, type);
  }

  @Get('list')
  async productList() {
    return await this.productService.productList();
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
  async addProduct(@Req() req: any, @Body() body: AddProductDTO) {
    return await this.productService.addProduct(req?.user?.sub, body);
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
  async updateProduct(@Req() req: any, @Body() body: UpdateProductDTO) {
    return await this.productService.updateProduct(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/admin/update')
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
  async updateProductAdmin(@Req() req: any, @Body() body: UpdateProductDTO) {
    return await this.productService.updateProductAdmin(
      req?.user?.sub,
      req?.params?.id,
      body,
    );
  }

  @Get('vendor/:id/all')
  async vendorProducts(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
    @Query('categoryId') categoryId?: string,
  ) {
    return await this.productService.allByVendor(
      req.params?.id,
      page,
      limit,
      categoryId,
    );
  }

  @Get('branch/:id/all')
  async branchProducts(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
    @Query('categoryId') categoryId?: string,
  ) {
    return await this.productService.allByBranch(
      req.params?.id,
      page,
      limit,
      categoryId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
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
  async deleteProduct(@Req() req: any) {
    return await this.productService.deleteProduct(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/admin/delete')
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
  async deleteProductAdmin(@Req() req: any) {
    return await this.productService.deleteProductAdmin(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @Get('offers/all')
  async offers(
    @Req() req: Request,
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.productService.allOffers(page, limit);
  }
}
