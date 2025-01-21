import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
import { Twilio } from 'twilio';
import { SMSProviders } from 'src/entities/sms.provider.entity';

@Injectable()
export class TwilioService implements SMSProviderInterface {
  constructor() {}

  async sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    try {
      const client = new Twilio(
        input.providerEntity.sender_name,
        input.providerEntity.public_key,
      );
      await client.messages.create({
        body: input.message,
        from: input.providerEntity.from_number,
        to: `+${input.phoneNumber}`,
      });
    } catch (error: unknown) {
      throw new HttpException((error as Error).message, HttpStatus.FORBIDDEN);
    }
  }
}
