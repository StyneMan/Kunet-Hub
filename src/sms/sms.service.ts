import { Injectable } from '@nestjs/common';
import { SendChampService } from './providers/sendchamp.service';
import { TwilioService } from './providers/twilio.service';
import { BroadnetService } from './providers/broadnet.service';
import { PlivoService } from './providers/plivo.service';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { SMSProviderType } from 'src/enums/sms.providers.enum';
import { TermiiService } from './providers/termii.service';

@Injectable()
export class SmsService {
  constructor(
    private sendChampService: SendChampService,
    private twilioService: TwilioService,
    private termiiService: TermiiService,
    private broadnetService: BroadnetService,
    private plivioService: PlivoService,
  ) {}

  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }) {
    switch (input.providerEntity.provider) {
      case SMSProviderType.BROADNET:
        return this.broadnetService.sendOTP(input);
      case SMSProviderType.PLIVIO:
        return this.plivioService.sendOTP(input);
      case SMSProviderType.SENDCHAMP:
        return this.sendChampService.sendOTP(input);
      case SMSProviderType.TWILIO:
        return this.twilioService.sendOTP(input);
      case SMSProviderType.TERMII:
        return this.termiiService.sendOTP(input);
      default:
        break;
    }
  }
}
