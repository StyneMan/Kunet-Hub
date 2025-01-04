import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RidersController } from './riders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from 'src/entities/rider.entity';
import { ZonesService } from 'src/zones/zones.service';
import { Zone } from 'src/entities/zone.entity';
import { Admin } from 'src/entities/admin.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { RiderDocument } from 'src/entities/rider.document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rider,
      Zone,
      Admin,
      RiderWallet,
      RiderDocument,
      RiderTransactions,
    ]),
  ],
  providers: [RidersService, ZonesService],
  controllers: [RidersController],
})
export class RidersModule {}
