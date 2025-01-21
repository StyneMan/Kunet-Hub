import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AddFAQDTO } from './dtos/addfaq.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { UpdateLegalDTO } from './dtos/udatelegal.dto';
import { ValidationError } from 'class-validator';
import { AddGatewayDTO } from './dtos/addgateway.dto';
import { UpdateGatewayDTO } from './dtos/updategateway.dto';
import { AddSizeDTO } from './dtos/addsize.dto';
import { UpdateSizeDTO } from './dtos/updatesize.dto';
import { AddColorDTO } from './dtos/addcolor.dto';
import { UpdateColorDTO } from './dtos/updatecolor.dto';
import { AddVariationDTO } from './dtos/addvariation.dto';
import { UpdateVariationDTO } from './dtos/updatevariation.dto';
import { UpdateCommissionAndFeeDTO } from './dtos/updatecomm-fee.dto';
import { AddSMSProviderDTO } from './dtos/addsms.provider.dto';
import { UpdateSMSProviderDTO } from './dtos/updatesms.provider.dto';
import { AddPackOptionDTO } from './dtos/addpack.option.dto';
import { UpdatePackOptionDTO } from './dtos/update.pack.option.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('faqs/create')
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
  async addFAQ(@Body() payload: AddFAQDTO, @Req() req: any) {
    return this.settingsService.addFAQ(req?.user?.sub, payload);
  }

  @Get('faqs/all')
  async allFAQS() {
    return this.settingsService.allFAQs();
  }

  @UseGuards(JwtAuthGuard)
  @Put('faqs/:id/update')
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
  async updateFAQ(
    @Body() payload: AddFAQDTO,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.settingsService.updateFAQ(req?.user?.sub, id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('faqs/:id/delete')
  async deleteFAQ(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteFAQ(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('legals/update')
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
  async updateLegal(@Body() payload: UpdateLegalDTO, @Req() req: any) {
    return this.settingsService.updateLegal(req?.user?.sub, payload);
  }

  @Get('legals')
  async getLegal() {
    return this.settingsService.findLegal();
  }

  @Get('payment/gateways')
  async getGateways() {
    return this.settingsService.allGateways();
  }

  // @UseGuards(JwtAuthGuard)
  @Post('payment/gateway/add')
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
  async addGateway(@Body() payload: AddGatewayDTO, @Req() req: any) {
    return this.settingsService.addGateway(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('payment/gateway/:id/update')
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
  async updateGateway(@Body() payload: UpdateGatewayDTO, @Req() req: any) {
    return this.settingsService.updateGateway(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('payment/gateway/:id/setDefault')
  async setDefaultGateway(@Req() req: any) {
    return this.settingsService.setDefaultGateway(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('payment/gateway/:id/delete')
  async deleteGateway(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteGateway(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('size/add')
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
  async addSize(@Body() payload: AddSizeDTO, @Req() req: any) {
    return this.settingsService.addSize(req?.user?.sub, payload);
  }

  @Get('size/all')
  async allSizes() {
    return this.settingsService.allSizes();
  }

  @UseGuards(JwtAuthGuard)
  @Put('size/:id/update')
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
  async updateSize(@Body() payload: UpdateSizeDTO, @Req() req: any) {
    return this.settingsService.updateSize(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('size/:id/delete')
  async deleteSize(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteSize(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('color/add')
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
  async addColor(@Body() payload: AddColorDTO, @Req() req: any) {
    return this.settingsService.addColor(req?.user?.sub, payload);
  }

  @Get('color/all')
  async allColors() {
    return this.settingsService.allColors();
  }

  @UseGuards(JwtAuthGuard)
  @Put('color/:id/update')
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
  async updateColor(@Body() payload: UpdateColorDTO, @Req() req: any) {
    return this.settingsService.updateColor(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('color/:id/delete')
  async deleteColor(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteColor(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('variation/add')
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
  async addVariation(@Body() payload: AddVariationDTO, @Req() req: any) {
    return this.settingsService.addVariation(req?.user?.sub, payload);
  }

  @Get('variation/all')
  async allVariations() {
    return this.settingsService.allVariations();
  }

  @UseGuards(JwtAuthGuard)
  @Put('variation/:id/update')
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
  async updateVariation(@Body() payload: UpdateVariationDTO, @Req() req: any) {
    return this.settingsService.updateVariation(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('variation/:id/delete')
  async deleteVariation(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteVariation(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('fees/upsert')
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
  async upsertFees(
    @Req() req: any,
    @Body() payload: UpdateCommissionAndFeeDTO,
  ) {
    return this.settingsService.upsertFees(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('fees/all')
  async allFees() {
    return this.settingsService.getFees();
  }

  @Get('sms/providers')
  async getSMSProviders() {
    return this.settingsService.allSMSProviders();
  }

  @UseGuards(JwtAuthGuard)
  @Post('sms/provider/add')
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
  async addSMSProvider(@Body() payload: AddSMSProviderDTO, @Req() req: any) {
    return this.settingsService.addSMSProvider(req?.user?.sub, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('sms/provider/:id/update')
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
  async updateSMSProvider(
    @Body() payload: UpdateSMSProviderDTO,
    @Req() req: any,
  ) {
    return this.settingsService.updateSMSProvider(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sms/provider/:id/setDefault')
  async setDefaultSMSProvider(@Req() req: any) {
    return this.settingsService.setDefaultSMSProvider(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('sms/provider/:id/delete')
  async deleteSMSProvider(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteSMSProvider(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pack/add')
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
  async addPack(@Body() payload: AddPackOptionDTO, @Req() req: any) {
    return this.settingsService.addPackoption(req?.user?.sub, payload);
  }

  @Get('pack/all')
  async allPacks() {
    return this.settingsService.allPackOptions();
  }

  @UseGuards(JwtAuthGuard)
  @Put('pack/:id/update')
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
  async updatePack(@Body() payload: UpdatePackOptionDTO, @Req() req: any) {
    return this.settingsService.updatePackOption(
      req?.user?.sub,
      req?.params?.id,
      payload,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('pack/:id/delete')
  async deletePack(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deletePackOption(req?.user?.sub, id);
  }
}
