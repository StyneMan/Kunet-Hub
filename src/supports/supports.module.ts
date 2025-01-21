import { Module } from '@nestjs/common';
import { SupportsController } from './supports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from 'src/entities/support.entity';
import { SupportsService } from './supports.service';
import { Customer } from 'src/entities/customer.entity';
import { Admin } from 'src/entities/admin.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Rider } from 'src/entities/rider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Support, Customer, Admin, Vendor, Rider]),
  ],
  controllers: [SupportsController],
  providers: [SupportsService],
})
export class SupportsModule {}
