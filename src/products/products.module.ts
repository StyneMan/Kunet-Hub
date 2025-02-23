import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Operator } from 'src/entities/operator.entity';
import { Admin } from 'src/entities/admin.entity';
import { Category } from 'src/entities/category.entity';
import { SocketModule } from 'src/socket/socket.module';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { Coupon } from 'src/entities/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Vendor,
      Operator,
      Admin,
      Category,
      Coupon,
      VendorLocation,
    ]),
    SocketModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
