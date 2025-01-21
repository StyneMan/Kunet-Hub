import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import axios from 'axios';

@Injectable()
export class BroadnetService implements SMSProviderInterface {
  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    const config = input.providerEntity;
    if (config == null) {
      throw new Error('Broadnet config not found');
    }
    Logger.log('Sending sms to ' + input.phoneNumber + ' using Broadnet');
    Logger.log('Message: ' + input.message);
    Logger.log('Config: ' + JSON.stringify(config));

    const response = await axios.get(
      'https://gw5s.broadnet.me:8443/websmpp/websms',
      {
        params: {
          user: config.sender_id,
          pass: config.private_key,
          sid: config.from_number,
          type: config.provider,
          mno: input.phoneNumber,
          text: input.message,
        },
      },
    );

    if (response.status !== 200) {
      throw new HttpException(
        'Broadnet failed to send sms, status: ' + response.statusText,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
