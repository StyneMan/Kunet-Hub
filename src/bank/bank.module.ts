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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorBank,
      RiderBank,
      Rider,
      Vendor,
      Operator,
      RiderWallet,
      VendorWallet,
      VendorPayoutRequest,
      RiderPayoutRequest,
      OperatorOTP,
      RiderOTP,
    ]),
  ],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
