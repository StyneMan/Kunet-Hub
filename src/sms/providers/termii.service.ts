import { HttpException, Injectable, Logger } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import axios from 'axios';

@Injectable()
export class TermiiService implements SMSProviderInterface {
  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    const config = input.providerEntity;
    const response = await axios.post(
      `https://v3.api.termii.com/api/sms/send`,
      {
        api_key: config?.public_key ?? config?.private_key,
        from: config?.sender_id ?? config?.from_number, // fastbuy
        to: '2347040277958', // input.phoneNumber,
        sms: input.message,
        type: 'plain',
        channel: 'generic',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    Logger.log(JSON.stringify(response.data), 'TermiiService');
    if (response.status !== 200) {
      throw new HttpException('Termii failed to send sms,', response?.status);
    }
  }
}
