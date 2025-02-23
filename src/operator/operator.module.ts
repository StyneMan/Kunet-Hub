import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from 'src/entities/operator.entity';
import { OperatorService } from './operator.service';
import { OperatorController } from './operator.controller';
import { Vendor } from 'src/entities/vendor.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Operator, Vendor, VendorLocation])],
  providers: [OperatorService],
  controllers: [OperatorController],
})
export class OperatorModule {}
