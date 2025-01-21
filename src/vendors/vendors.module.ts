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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      Operator,
      Admin,
      Zone,
      Category,
      Customer,
      VendorWallet,
      OperatorDocument,
      VendorTransactions,
    ]),
  ],
  providers: [VendorsService, ZonesService],
  controllers: [VendorsController],
})
export class VendorsModule {}
