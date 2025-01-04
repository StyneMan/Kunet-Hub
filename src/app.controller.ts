import { Body, Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomeMessage() {
    return { message: 'WELCOME TO FASTBUY API' };
  }

  @Put('image/upload')
  uploadSingleImage(@Body() body: any) {
    return this.appService.imageUploader(body?.image);
  }

  @Put('images/upload')
  uploadMultipleImages(@Body() body: any) {
    return this.appService.imagesUploader(body?.images);
  }
}
