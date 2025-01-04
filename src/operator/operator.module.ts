import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from 'src/entities/operator.entity';
import { OperatorService } from './operator.service';
import { OperatorController } from './operator.controller';
import { Vendor } from 'src/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Operator, Vendor])],
  providers: [OperatorService],
  controllers: [OperatorController],
})
export class OperatorModule {}
