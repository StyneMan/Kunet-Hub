/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SendNotificationDTO } from './dtos/send.notification.dto';
import serviceAccount from '../utils/myfastbuy-adminsdk.json'; // Import JSON file

@Injectable()
export class NotificationService {
  constructor() {
    // Innitialize FCM admin SDK
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }
  }

  async sendPushNotification(token: string, payload: SendNotificationDTO) {
    const message = {
      notification: { title: payload.title, body: payload.message },
      token: token,
      data: { ...payload },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:: ', response);
      return response;
    } catch (error) {
      console.error('ERROR SSEND NOTIFICATION ::: ', error);
      throw error;
    }
  }
}
