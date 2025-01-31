import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SocketModule } from 'src/socket/socket.module';
import { Customer } from 'src/entities/customer.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Rider } from 'src/entities/rider.entity';
import { Chat } from 'src/entities/chat.entity';
import { ChatMessage } from 'src/entities/chat.message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Rider, Chat, Vendor, Customer]),
    SocketModule,
  ],
  providers: [ChatService],
})
export class ChatModule {}
