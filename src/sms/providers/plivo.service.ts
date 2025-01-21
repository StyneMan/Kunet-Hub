import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'plivo';
import { SMSProviderInterface } from './sms-provider.interface';
import { SMSProviders } from 'src/entities/sms.provider.entity';

@Injectable()
export class PlivoService implements SMSProviderInterface {
  constructor() {}

  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    const client = new Client(
      input.providerEntity.sender_id,
      input.providerEntity.public_key,
    );
    const result = await client.messages.create(
      input.providerEntity.from_number,
      input.phoneNumber,
      input.message,
    );
    Logger.log(JSON.stringify(result), 'PlivoService');
  }
}
