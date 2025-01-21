import { SMSProviders } from 'src/entities/sms.provider.entity';

export abstract class SMSProviderInterface {
  abstract sendOTP(input: {
    providerEntity: SMSProviders;
    phoneNumber: string;
    message: string;
  }): Promise<void>;
}
