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
import { BankService } from './bank.service';
import { ValidationError } from 'class-validator';
import { VerifyAccountDTO } from './dtos/verifyaccount.dto';
import { AddBankDTO } from './dtos/addbank.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { Request } from 'express';
import { FlutterwavePaymentLinkDTO } from './dtos/flutterwave.payment.dto';
import { PayCardOrderDTO, PayWalletOrderDTO } from './dtos/pay.card.order.dto';
import { UpdateBankDTO } from './dtos/updatebank.dto';

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
  @Put('vendor/accounts/:id/update')
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
  async updateVendorBankAccount(
    @Req() req: any,
    @Body() payload: UpdateBankDTO,
  ) {
    try {
      return this.bankService.updateVendorBank(
        req?.user?.sub,
        req?.params?.id,
        payload,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('vendor/accounts/:id/delete')
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
  async deleteVendorBankAccount(@Req() req: any) {
    try {
      return this.bankService.deleteVendorBank(req?.user?.sub, req?.params?.id);
    } catch (error) {
      console.log(error);
    }
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
      return this.bankService.addRiderBank(payload);
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
  @Put('rider/accounts/:id/update')
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
  async updateRiderBankAccount(
    @Req() req: any,
    @Body() payload: UpdateBankDTO,
  ) {
    try {
      return this.bankService.updateRiderBank(
        req?.user?.sub,
        req?.params?.id,
        payload,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('rider/accounts/:id/delete')
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
  async deleteRiderBankAccount(@Req() req: any) {
    try {
      return this.bankService.deleteRiderBank(req?.user?.sub, req?.params?.id);
    } catch (error) {
      console.log(error);
    }
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

  @UseGuards(JwtAuthGuard)
  @Post('payment/init')
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
  async initPayment(@Body() payload: FlutterwavePaymentLinkDTO) {
    return this.bankService.initPayment(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/order/card')
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
  async initPaywithCard(@Body() payload: PayCardOrderDTO) {
    return this.bankService.orderChargeCard(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/order/wallet')
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
  async initPaywithWallet(@Body() payload: PayWalletOrderDTO, @Req() req: any) {
    return this.bankService.orderWithWallet(req?.user?.sub, payload);
  }

  @Post('flutterwave/webhook')
  async flutterwaveWebhook(@Req() req: Request) {
    console.log('REQUEST ::: ', req.body);
    // console.log('RESPONSE ::: ', res);
    const event = req.body?.event;
    if (event === 'charge.completed') {
      const data = req.body?.data;
      console.log('DATA HERE ::: ', data);
      if (`${data?.tx_ref}`.startsWith('FBW')) {
        return this.bankService.flutterwaveWebHook(data);
      } else {
        return this.bankService.flutterwaveCardWebHook(data);
      }
    }
  }

  @Post('paystack/webhook')
  async paystackWebhook(@Req() req: Request) {
    console.log('PAYLOAD DATA ::: ', req.body?.data);
    // console.log('RESPONSE ::: ', res.status);

    const event = req.body?.event;
    if (event === 'charge.success') {
      const data = req.body?.data;
      console.log('DATA HERE ::: ', data);
      return this.bankService.paystackWebHook(data);
    }
  }
}
