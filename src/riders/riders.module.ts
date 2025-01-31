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
import { Complaint } from 'src/entities/complaint.entity';
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
      RiderWallet,
      RiderReview,
      RiderDocument,
      AdminActivity,
      Complaint,
      VendorWallet,
      SMSProviders,
      CommissionAndFee,
      RiderTransactions,
      VendorTransactions,
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
  ],
  controllers: [RidersController],
})
export class RidersModule {}
