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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { CreateAdminDTO } from './dtos/createadmin.dto';
import { ValidationError } from 'class-validator';
import { Request } from 'express';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allAdmins(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.adminService.findAdmins(page, limit);
  }

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
  async createAdmin(@Body() body: CreateAdminDTO) {
    return await this.adminService.createAdmin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/profile')
  async profile(@Req() req: any) {
    return await this.adminService.findCurrentAdmin(req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/suspend')
  async suspendAdmin(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.adminService.suspendAdmin(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pardon')
  async pardonAdmin(@Req() req: any) {
    return await this.adminService.pardonAdmin(req?.user?.sub, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update')
  async updateAdmin(@Req() req: any) {
    return await this.adminService.adminUpdateAdmin(
      req?.user?.sub,
      req?.params?.id,
      req?.body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/update')
  async updateProfile(@Req() req: Request | any) {
    console.log('LOKO:: ', req?.user?.sub);

    return await this.adminService.updateAdmin(req?.user?.sub, req?.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  async deleteAdmin(@Req() req: any) {
    return await this.adminService.deleteAdmin(req?.user?.sub, req?.params?.id);
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
    return await this.adminService.updateAdminFCMToken(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async adminNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.adminService.findAdminNotifications(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/notifications/read')
  async markAsReadNotifications(@Req() req: any) {
    return await this.adminService.markAllAsRead(req?.params?.id);
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
    return this.adminService.setWalletPin(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  async getWallet() {
    return this.adminService.findAdminWallet();
  }
}
