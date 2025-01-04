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
import { BankService } from './bank.service';
import { ValidationError } from 'class-validator';
import { VerifyAccountDTO } from './dtos/verifyaccount.dto';
import { AddBankDTO } from './dtos/addbank.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { Request } from 'express';

@Controller('bank')
export class BankController {
  constructor(private bankService: BankService) {}

  @Get('list')
  async getBanks() {
    return this.bankService.banks();
  }

  @Post('verify')
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
  async verifyAccount(@Body() payload: VerifyAccountDTO) {
    try {
      return this.bankService.verifyAccount(payload);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('vendor/add')
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
  async addVendorBankAccount(@Body() payload: AddBankDTO) {
    try {
      return this.bankService.addVendorBank(payload);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/accounts')
  async allVendorBankAccounts(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.findAllVendorBankAccounts(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/:id/accounts')
  async vendorBankAccounts(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.findVendorBankAccounts(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('rider/add')
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
  async addRiderBankAccount(@Body() payload: AddBankDTO) {
    try {
      return this.bankService.addVendorBank(payload);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('rider/accounts')
  async allRiderBankAccounts(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.findAllRiderBankAccounts(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rider/:id/accounts')
  async riderBankAccounts(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.findRiderBankAccounts(
      page,
      limit,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('rider/payouts')
  async riderPayouts(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.allRiderPayoutRequests(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/payouts')
  async vendorPayouts(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.bankService.allVendorPayoutRequests(page, limit);
  }
}
