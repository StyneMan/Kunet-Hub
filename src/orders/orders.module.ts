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
import { SocketModule } from 'src/socket/socket.module';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Vendor,
      Order,
      Operator,
      Rider,
      Product,
      RiderWallet,
      VendorWallet,
      CommissionAndFee,
      RiderTransactions,
      VendorTransactions,
      SystemTransactions,
    ]),
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
