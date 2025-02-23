import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { FindOrCcreateChatDTO } from './dtos/create.chat.dto';
import { PostMessageDTO } from './dtos/post.message.dto';
import { ChatMemberType } from 'src/enums/user.type.enum';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to your specific client URL for better security
    methods: ['GET', 'POST', 'PUT'],
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: FindOrCcreateChatDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    const payload = data;
    const chat = await this.chatService.findOrCreateChat(payload);

    socket.join(`chat-${chat.id}`);
  }

  @SubscribeMessage('postMessage')
  async handleMessage(
    @MessageBody()
    data: {
      chatData: FindOrCcreateChatDTO;
      msgData: PostMessageDTO;
    },
  ) {
    const chat = await this.chatService.findOrCreateChat(data.chatData);
    const message = await this.chatService.postMessage(chat, data?.msgData);
    this.server.to(`chat-${chat.id}`).emit('newMessage', message);
  }

  @SubscribeMessage('userMessages')
  async fetchMessages(
    @MessageBody() payload: { userType: ChatMemberType; userId: string },
  ) {
    const messages = await this.chatService.userChats(
      payload?.userType,
      payload?.userId,
    );
    return messages;
  }
}
