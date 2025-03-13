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
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';
import { NotificationService } from 'src/notification/notification.service';
import { AdminWallet } from 'src/entities/admin.wallet.entity';
import { VendorNotification } from 'src/entities/vendor.notification.entity';
import { RiderReview } from 'src/entities/rider.review.entity';
import { PendingReviews } from 'src/entities/pending.reviews.entity';
import { VendorReview } from 'src/entities/vendor.review.entity';
import { AdminNotification } from 'src/entities/admin.notification.entity';
import { Admin } from 'src/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Vendor,
      Order,
      Admin,
      Operator,
      Rider,
      Product,
      DummyOrder,
      AdminWallet,
      RiderWallet,
      VendorWallet,
      RiderReview,
      VendorReview,
      PendingReviews,
      VendorLocation,
      CommissionAndFee,
      RiderTransactions,
      AdminNotification,
      VendorTransactions,
      SystemTransactions,
      VendorNotification,
    ]),
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, NotificationService],
})
export class OrdersModule {}
