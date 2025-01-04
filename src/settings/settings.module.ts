import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from 'src/entities/faq.entity';
import { Legal } from 'src/entities/legal.entity';
import { Admin } from 'src/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ, Legal, Admin])],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
