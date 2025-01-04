import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AddFAQDTO } from './dtos/addfaq.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('faqs/create')
  async addFAQ(@Body() payload: AddFAQDTO, @Req() req: any) {
    return this.settingsService.addFAQ(req?.user?.sub, payload);
  }

  @Get('faqs/all')
  async allFAQS() {
    return this.settingsService.allFAQs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('faqs/:id/update')
  async updateFAQ(
    @Body() payload: AddFAQDTO,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.settingsService.updateFAQ(req?.user?.sub, id, payload);
  }
}
