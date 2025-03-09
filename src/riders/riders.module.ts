import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RidersController } from './riders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from 'src/entities/rider.entity';
import { ZonesService } from 'src/zones/zones.service';
import { Zone } from 'src/entities/zone.entity';
import { Admin } from 'src/entities/admin.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { RiderDocument } from 'src/entities/rider.document.entity';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Customer } from 'src/entities/customer.entity';
import { Operator } from 'src/entities/operator.entity';
import { RiderReview } from 'src/entities/rider.review.entity';
import { Order } from 'src/entities/order.entity';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { SocketModule } from 'src/socket/socket.module';
import { OrdersService } from 'src/orders/orders.service';
import { SmsService } from 'src/sms/sms.service';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { SendChampService } from 'src/sms/providers/sendchamp.service';
import { TermiiService } from 'src/sms/providers/termii.service';
import { TwilioService } from 'src/sms/providers/twilio.service';
import { PlivoService } from 'src/sms/providers/plivo.service';
import { BroadnetService } from 'src/sms/providers/broadnet.service';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';
import { NotificationService } from 'src/notification/notification.service';
import { AdminWallet } from 'src/entities/admin.wallet.entity';
import { VendorNotification } from 'src/entities/vendor.notification.entity';
import { PendingReviews } from 'src/entities/pending.reviews.entity';
import { VendorReview } from 'src/entities/vendor.review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rider,
      Zone,
      Admin,
      Order,
      Vendor,
      Customer,
      Operator,
      DummyOrder,
      RiderWallet,
      RiderReview,
      RiderDocument,
      AdminWallet,
      AdminActivity,
      VendorLocation,
      VendorWallet,
      SMSProviders,
      PendingReviews,
      VendorReview,
      CommissionAndFee,
      RiderTransactions,
      VendorTransactions,
      VendorNotification,
      SystemTransactions,
    ]),
    SocketModule,
  ],
  providers: [
    RidersService,
    ZonesService,
    OrdersService,
    SmsService,
    SendChampService,
    TermiiService,
    TwilioService,
    PlivoService,
    BroadnetService,
    NotificationService,
  ],
  controllers: [RidersController],
})
export class RidersModule {}
