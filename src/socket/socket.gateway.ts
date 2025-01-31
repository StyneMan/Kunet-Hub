import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserType } from 'src/enums/user.type.enum';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to your specific client URL for better security
    methods: ['GET', 'POST', 'PUT'],
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private customers: Record<string, { socketId: string; userType: UserType }> =
    {};
  private vendors: Record<string, { socketId: string }> = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Emit back to  client
    client.emit('handshake', 'HEY');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove the user from the connected users map
    for (const [userId, userData] of Object.entries(this.customers)) {
      if (userData.socketId === client.id) {
        delete this.customers[userId];
        break;
      }
    }
  }

  @SubscribeMessage('register')
  registerUser(
    client: Socket,
    payload: { userId: string; userType: UserType },
  ) {
    const { userId, userType } = payload;
    this.customers[userId] = { socketId: client.id, userType };
    console.log(`Customer registered: ${userId}, Type: ${userType}`);

    client.emit('notification', { message: 'Welcome to FastBuy!' });
  }

  @SubscribeMessage('cart')
  cartTrigger(client: Socket, payload) {
    // const { userId, userType } = payload;
    console.log('CART TRIGGER FROM CLIENT ::: ', payload);
    // Test immediate emission
    client.emit('notification', { message: '' });
  }

  sendNotification(userId: string, userType: UserType, payload: any) {
    const user = Object.entries(this.customers).find(
      ([id, userData]) => id === userId && userData.userType === userType,
    );

    if (user) {
      const [, userData] = user;
      this.server.to(userData.socketId).emit('notification', payload);
      console.log(`Notification sent to user ${userId}`);
    } else {
      console.log(
        `No connected user found for ID: ${userId}, Type: ${userType}`,
      );
    }
  }

  sendEvent(userId: string, userType: UserType, event: string, payload: any) {
    const user = Object.entries(this.customers).find(
      ([, userData]) => userData.userType === userType && userData.socketId,
    );

    if (user) {
      const [, userData] = user;
      this.server.to(userData.socketId).emit(event, payload);
    } else {
      console.log(
        `No connected user found for ID: ${userId}, Type: ${userType}`,
      );
    }
  }

  @SubscribeMessage('registerVendor')
  registerVendorOperator(
    clien: Socket,
    payload: {
      vendorId: string;
    },
  ) {
    const { vendorId } = payload;
    this.vendors[vendorId] = { socketId: clien.id };
    console.log(`VENDOR registered: ${vendorId}`);

    // Test immediate emission
    clien.emit('notification', { message: 'Welcome to FastBuy!' });
  }

  sendVendorNotification(vendorId: string, payload: any) {
    const user = Object.entries(this.vendors).find(([id]) => id === vendorId);

    if (user) {
      const [, userData] = user;
      this.server.to(userData.socketId).emit('notification', payload);
      console.log(`Notification sent to vendor ${vendorId}`);
    } else {
      console.log(`No connected vendor found for ID: ${vendorId}`);
    }
  }

  // Vendor Events:
  // refresh-categories, refresh-products, refresh-staffs,
  // refresh-coupons, refresh-orders, refresh-transactions,
  // refresh-accounts, refresh-settings
  sendVendorEvent(vendorId: string, event: string, payload: any) {
    const user = Object.entries(this.vendors).find(
      ([, userData]) => userData.socketId === vendorId && userData.socketId,
    );

    if (user) {
      const [, userData] = user;
      this.server.to(userData.socketId).emit(event, payload);
    } else {
      console.log(`No connected VENDOR found for ID: ${vendorId}`);
    }
  }

  // sendAdminNotification(payload: any) {
  //   const user = Object.entries(this.vendors).find(([id]) => id === vendorId);

  //   if (user) {
  //     const [, userData] = user;
  //     this.server.to(userData.socketId).emit('notification', payload);
  //     console.log(`Notification sent to vendor ${vendorId}`);
  //   } else {
  //     console.log(`No connected vendor found for ID: ${vendorId}`);
  //   }
  // }
}
