import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from 'src/entities/faq.entity';
import { Legal } from 'src/entities/legal.entity';
import { Admin } from 'src/entities/admin.entity';
import { PaymentGateway } from 'src/entities/payment.gateway.entity';
import { Size } from 'src/entities/size.entity';
import { Bike } from 'src/entities/bike.entity';
import { Variation } from 'src/entities/variations.entity';
import { Color } from 'src/entities/color.entity';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { PackOption } from 'src/entities/pack.option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FAQ,
      Legal,
      Admin,
      PaymentGateway,
      Size,
      Bike,
      Variation,
      Color,
      PackOption,
      SMSProviders,
      CommissionAndFee,
    ]),
  ],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
