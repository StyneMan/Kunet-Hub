import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { VendorBank } from 'src/entities/vendor.bank.entity';
import { RiderBank } from 'src/entities/rider.bank.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from 'src/entities/rider.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Operator } from 'src/entities/operator.entity';
import { VendorPayoutRequest } from 'src/entities/vendor.payout.request.entity';
import { RiderPayoutRequest } from 'src/entities/rider.payout.request.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { OperatorOTP } from 'src/entities/otp.operator.entity';
import { RiderOTP } from 'src/entities/otp.rider.entity';
import { PaymentGateway } from 'src/entities/payment.gateway.entity';
import { FlutterwaveService } from './gateways/flutterwave/flutterwave_service';
import { PaystackService } from './gateways/paystack/paystack_service';
import { Admin } from 'src/entities/admin.entity';
import { Customer } from 'src/entities/customer.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { RiderReview } from 'src/entities/rider.review.entity';
import { SocketModule } from 'src/socket/socket.module';
import { Order } from 'src/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { Cart } from 'src/entities/cart.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';
import { NotificationService } from 'src/notification/notification.service';
import { AdminWallet } from 'src/entities/admin.wallet.entity';
import { VendorNotification } from 'src/entities/vendor.notification.entity';
import { PendingReviews } from 'src/entities/pending.reviews.entity';
import { VendorReview } from 'src/entities/vendor.review.entity';
import { AdminNotification } from 'src/entities/admin.notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorBank,
      RiderBank,
      Rider,
      Cart,
      Admin,
      Order,
      Vendor,
      Customer,
      Operator,
      DummyOrder,
      RiderReview,
      RiderWallet,
      AdminWallet,
      VendorReview,
      VendorWallet,
      PendingReviews,
      VendorLocation,
      PaymentGateway,
      AdminNotification,
      RiderTransactions,
      VendorTransactions,
      SystemTransactions,
      RiderPayoutRequest,
      VendorPayoutRequest,
      VendorNotification,
      CustomerTransactions,
      CommissionAndFee,
      CustomerWallet,
      OperatorOTP,
      RiderOTP,
    ]),
    SocketModule,
  ],
  controllers: [BankController],
  providers: [
    BankService,
    FlutterwaveService,
    PaystackService,
    OrdersService,
    NotificationService,
  ],
})
export class BankModule {}
