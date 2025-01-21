import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Order } from 'src/entities/order.entity';
import { Operator } from 'src/entities/operator.entity';
import { Rider } from 'src/entities/rider.entity';
import { Product } from 'src/entities/product.entity';
import { CommissionAndFee } from 'src/entities/fee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Vendor,
      Order,
      Operator,
      Rider,
      Product,
      CommissionAndFee,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
