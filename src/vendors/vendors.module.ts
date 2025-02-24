import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from 'src/entities/vendor.entity';
import { Operator } from 'src/entities/operator.entity';
import { Admin } from 'src/entities/admin.entity';
import { Category } from 'src/entities/category.entity';
import { ZonesService } from 'src/zones/zones.service';
import { Zone } from 'src/entities/zone.entity';
import { OperatorDocument } from 'src/entities/operator.document.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { Customer } from 'src/entities/customer.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { SocketModule } from 'src/socket/socket.module';
import { WorkHour } from 'src/entities/working.hour.entity';
import { Order } from 'src/entities/order.entity';
import { SmsService } from 'src/sms/sms.service';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { SendChampService } from 'src/sms/providers/sendchamp.service';
import { TermiiService } from 'src/sms/providers/termii.service';
import { PlivoService } from 'src/sms/providers/plivo.service';
import { TwilioService } from 'src/sms/providers/twilio.service';
import { BroadnetService } from 'src/sms/providers/broadnet.service';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { VendorDocument } from 'src/entities/vendor.document.entity';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      Operator,
      Admin,
      Zone,
      Order,
      Coupon,
      WorkHour,
      Category,
      Customer,
      SMSProviders,
      VendorWallet,
      VendorLocation,
      VendorDocument,
      CustomerWallet,
      OperatorDocument,
      CommissionAndFee,
      SystemTransactions,
      VendorTransactions,
    ]),
    SocketModule,
  ],
  providers: [
    VendorsService,
    ZonesService,
    SmsService,
    SendChampService,
    TermiiService,
    PlivoService,
    TwilioService,
    BroadnetService,
    NotificationService,
  ],
  controllers: [VendorsController],
})
export class VendorsModule {}
