import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Banner } from 'src/entities/banner.entity';
import { Product } from 'src/entities/product.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { SocketModule } from 'src/socket/socket.module';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { VendorLocation } from 'src/entities/vendor.location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, Admin, Product, Vendor, VendorLocation]),
    SocketModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
