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

  private users: Record<string, { socketId: string; userType: UserType }> = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove the user from the connected users map
    for (const [userId, userData] of Object.entries(this.users)) {
      if (userData.socketId === client.id) {
        delete this.users[userId];
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
    this.users[userId] = { socketId: client.id, userType };
    console.log(`User registered: ${userId}, Type: ${userType}`);

    // const { userId, userType } = payload;
    // this.users[userId] = { socketId: client.id, userType };
    // console.log('Current users:', this.users); // Debugging
    // console.log(`User registered: ${userId}, Type: ${userType}`);

    // Test immediate emission
    client.emit('notification', { message: 'Welcome to FastBuy!' });
  }

  @SubscribeMessage('cart')
  cartTrigger(client: Socket, payload) {
    // const { userId, userType } = payload;
    console.log('CART TRIGGER FROM CLIENT ::: ', payload);

    // this.users[userId] = { socketId: client.id, userType };
    // console.log(`User registered: ${userId}, Type: ${userType}`);

    // const { userId, userType } = payload;
    // this.users[userId] = { socketId: client.id, userType };
    // console.log('Current users:', this.users); // Debugging
    // console.log(`User registered: ${userId}, Type: ${userType}`);

    // Test immediate emission
    client.emit('notification', { message: '' });
  }

  sendNotification(userId: string, userType: UserType, payload: any) {
    // const user = Object.entries(this.users).find(
    //   ([, userData]) => userData.userType === userType && userData.socketId,
    // );

    // if (user) {
    //   const [, userData] = user;
    //   this.server.to(userData.socketId).emit('notification', { ...payload });
    // } else {
    //   console.log(
    //     `No connected user found for ID: ${userId}, Type: ${userType}`,
    //   );
    // }

    const user = Object.entries(this.users).find(
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
    const user = Object.entries(this.users).find(
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
}
