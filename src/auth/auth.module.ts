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
import { NotificationGateway } from 'src/notification/notification.gateway';

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
      RiderOTP,
      AdminActivity,
      Cart,
      Zone,
      Product,
      Vendor,
      RiderWallet,
      RiderDocument,
      RiderTransactions,
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'abcdfast123BuyJakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1d' },
    }),
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
    NotificationGateway,
  ],
})
export class AuthModule {}
