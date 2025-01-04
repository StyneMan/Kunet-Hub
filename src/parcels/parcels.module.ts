import { Module } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { ParcelsController } from './parcels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Parcel } from 'src/entities/parcel.entity';
import { Rider } from 'src/entities/rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Parcel, Rider])],
  providers: [ParcelsService],
  controllers: [ParcelsController],
})
export class ParcelsModule {}
