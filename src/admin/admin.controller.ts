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
  @Post('rider/:id/suspend')
  async suspendRider(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.adminService.suspendRider(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('rider/:id/pardon')
  async pardonRider(@Req() req: any) {
    return await this.adminService.pardonRider(req?.user?.sub, req?.params?.id);
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
  @Post(':id/delete')
  async deleteAdmin(@Req() req: any) {
    return await this.adminService.deleteAdmin(req?.user?.sub, req?.params?.id);
  }
}
