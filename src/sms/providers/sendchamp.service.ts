import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
// import axios from 'axios';
import Sendchamp from 'sendchamp-sdk';
import {
  SendchampMode,
  // SenderUseCase,
  SMSRoute,
} from 'sendchamp-sdk/lib/constants/types';
import { SMSProviders } from 'src/entities/sms.provider.entity';

@Injectable()
export class SendChampService implements SMSProviderInterface {
  constructor() {}

  // 08157746432

  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    try {
      const sendchamp = new Sendchamp({
        mode: SendchampMode.live,
        publicKey: input.providerEntity.public_key,
      });

      // Initialize a service
      const sms = sendchamp.SMS;

      sms
        .send({
          to: input.phoneNumber,
          message: input.message,
          sender_name: input.providerEntity.sender_name,
          route: SMSRoute.dnd,
        })
        .then((response) => {
          console.log('SENDCHAMP ', response);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error: unknown) {
      throw new HttpException((error as Error).message, HttpStatus.FORBIDDEN);
    }
  }
}
