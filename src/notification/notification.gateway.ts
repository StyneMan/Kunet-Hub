import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserType } from 'src/enums/user.type.enum';

@WebSocketGateway({ cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
  }

  sendNotification(userId: string, userType: UserType, message: string) {
    const user = Object.entries(this.users).find(
      ([, userData]) => userData.userType === userType && userData.socketId,
    );

    if (user) {
      const [, userData] = user;
      this.server.to(userData.socketId).emit('notification', { message });
    } else {
      console.log(
        `No connected user found for ID: ${userId}, Type: ${userType}`,
      );
    }
  }
}
