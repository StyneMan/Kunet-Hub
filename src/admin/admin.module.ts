import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { AdminOTP } from 'src/entities/otp.admin.entity';
import { CustomerOTP } from 'src/entities/otp.customer.entity';
import { RiderOTP } from 'src/entities/otp.rider.entity';
import { AdminAuthService } from 'src/auth/auth-services/admin.auth.service';
import { CustomerAuthService } from 'src/auth/auth-services/customer.auth.service';
import { RiderAuthService } from 'src/auth/auth-services/rider.auth.service';
import { OperatorAuthService } from 'src/auth/auth-services/operator.auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Customer } from 'src/entities/customer.entity';
import { Rider } from 'src/entities/rider.entity';
import { OperatorOTP } from 'src/entities/otp.operator.entity';
import { CustomerService } from 'src/customer/customer.service';
import { RidersService } from 'src/riders/riders.service';
import { OperatorService } from 'src/operator/operator.service';
import { Operator } from 'src/entities/operator.entity';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { Zone } from 'src/entities/zone.entity';
import { ZonesService } from 'src/zones/zones.service';
import { Vendor } from 'src/entities/vendor.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { RiderDocument } from 'src/entities/rider.document.entity';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { SmsService } from 'src/sms/sms.service';
import { PlivoService } from 'src/sms/providers/plivo.service';
import { TwilioService } from 'src/sms/providers/twilio.service';
import { BroadnetService } from 'src/sms/providers/broadnet.service';
import { SendChampService } from 'src/sms/providers/sendchamp.service';
import { ShippingAddress } from 'src/entities/shipping.address.entity';
import { TermiiService } from 'src/sms/providers/termii.service';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { PackOption } from 'src/entities/pack.option.entity';
import { CustomerFavourites } from 'src/entities/customer.favourites.entity';
import { CartItem } from 'src/entities/cart.item.entity';
import { SocketModule } from 'src/socket/socket.module';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { RiderReview } from 'src/entities/rider.review.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { Order } from 'src/entities/order.entity';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { Complaint } from 'src/entities/complaint.entity';
import { OrdersService } from 'src/orders/orders.service';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { Banner } from 'src/entities/banner.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      AdminOTP,
      CustomerOTP,
      RiderOTP,
      Customer,
      Rider,
      OperatorOTP,
      Operator,
      AdminActivity,
      Cart,
      Product,
      Zone,
      Order,
      Vendor,
      Banner,
      Coupon,
      Complaint,
      CommissionAndFee,
      CartItem,
      DummyOrder,
      PackOption,
      RiderWallet,
      RiderReview,
      RiderDocument,
      SMSProviders,
      VendorWallet,
      VendorLocation,
      CustomerWallet,
      ShippingAddress,
      RiderTransactions,
      CustomerFavourites,
      CustomerTransactions,
      VendorTransactions,
      SystemTransactions,
    ]),
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'abcdfast123BuyJakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1d' },
    }),
    SocketModule,
  ],
  controllers: [AdminController],
  providers: [
    SmsService,
    ZonesService,
    AdminService,
    CustomerService,
    RidersService,
    OperatorService,
    AdminAuthService,
    RiderAuthService,
    CustomerAuthService,
    OperatorAuthService,
    OrdersService,
    PlivoService,
    TwilioService,
    TermiiService,
    BroadnetService,
    SendChampService,
  ],
})
export class AdminModule {}
