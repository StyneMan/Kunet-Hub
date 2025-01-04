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
      Vendor,
      RiderWallet,
      RiderDocument,
      RiderTransactions,
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'abc123JakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AdminController],
  providers: [
    ZonesService,
    AdminService,
    CustomerService,
    RidersService,
    OperatorService,
    AdminAuthService,
    CustomerAuthService,
    RiderAuthService,
    OperatorAuthService,
  ],
})
export class AdminModule {}
