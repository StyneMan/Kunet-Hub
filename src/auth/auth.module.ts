import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminAuthService } from './auth-services/admin.auth.service';
import { CustomerAuthService } from './auth-services/customer.auth.service';
import { RiderAuthService } from './auth-services/rider.auth.service';
import { OperatorAuthService } from './auth-services/operator.auth.service';
import { AdminService } from 'src/admin/admin.service';
import { CustomerService } from 'src/customer/customer.service';
import { RidersService } from 'src/riders/riders.service';
import { OperatorService } from 'src/operator/operator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Admin } from 'src/entities/admin.entity';
import { Rider } from 'src/entities/rider.entity';
import { Operator } from 'src/entities/operator.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminOTP } from 'src/entities/otp.admin.entity';
import { CustomerOTP } from 'src/entities/otp.customer.entity';
import { OperatorOTP } from 'src/entities/otp.operator.entity';
import { RiderOTP } from 'src/entities/otp.rider.entity';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { LocalStrategy } from './utils/local_strategy';
import { JwtStrategy } from './utils/jwt_strategy';
import { GoogleStrategy } from './utils/google_strategy';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { ZonesService } from 'src/zones/zones.service';
import { Zone } from 'src/entities/zone.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { RiderDocument } from 'src/entities/rider.document.entity';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { SmsService } from 'src/sms/sms.service';
import { TwilioService } from 'src/sms/providers/twilio.service';
import { BroadnetService } from 'src/sms/providers/broadnet.service';
import { SendChampService } from 'src/sms/providers/sendchamp.service';
import { PlivoService } from 'src/sms/providers/plivo.service';
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
import { OrdersService } from 'src/orders/orders.service';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { Banner } from 'src/entities/banner.entity';
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
      Customer,
      Admin,
      Rider,
      Operator,
      AdminOTP,
      CustomerOTP,
      OperatorOTP,
      AdminActivity,
      RiderOTP,
      Cart,
      Zone,
      Order,
      Vendor,
      Coupon,
      Product,
      CartItem,
      PackOption,
      RiderWallet,
      RiderReview,
      SMSProviders,
      RiderDocument,
      Banner,
      AdminWallet,
      DummyOrder,
      VendorReview,
      CommissionAndFee,
      CustomerWallet,
      VendorWallet,
      PendingReviews,
      VendorLocation,
      ShippingAddress,
      RiderTransactions,
      CustomerFavourites,
      CustomerTransactions,
      VendorTransactions,
      SystemTransactions,
      VendorNotification,
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'abcdfast123BuyJakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1d' },
    }),
    SocketModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminService,
    RidersService,
    CustomerService,
    OperatorService,
    AdminAuthService,
    CustomerAuthService,
    OperatorAuthService,
    RiderAuthService,
    GoogleStrategy,
    LocalStrategy,
    ZonesService,
    JwtStrategy,
    SmsService,
    OrdersService,
    PlivoService,
    TwilioService,
    TermiiService,
    BroadnetService,
    SendChampService,
    NotificationService,
  ],
})
export class AuthModule {}
