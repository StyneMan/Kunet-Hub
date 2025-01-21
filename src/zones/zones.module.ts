import { Module } from '@nestjs/common';
import { ZonesController } from './zones.controller';
import { ZonesService } from './zones.service';
import { Zone } from 'src/entities/zone.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Admin])],
  controllers: [ZonesController],
  providers: [ZonesService],
})
export class ZonesModule {}
