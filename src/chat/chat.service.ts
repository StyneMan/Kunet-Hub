import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entities/chat.entity';
import { ChatMessage } from 'src/entities/chat.message.entity';
import { Customer } from 'src/entities/customer.entity';
import { Rider } from 'src/entities/rider.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { ChatMemberType } from 'src/enums/user.type.enum';
import { Repository } from 'typeorm';
import { PostMessageDTO } from './dtos/post.message.dto';
import { FindOrCcreateChatDTO } from './dtos/create.chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(VendorLocation)
    private vendorLocationRepository: Repository<VendorLocation>,
  ) {}

  async findOrCreateChat(payload: FindOrCcreateChatDTO): Promise<Chat> {
    // Query to check if a chat exists with both members
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .where(
        `JSON_CONTAINS(chat.members, :sender, '$') AND JSON_CONTAINS(chat.members, :receiver, '$')`,
        {
          sender: JSON.stringify({ memberId: payload.senderId }),
          receiver: JSON.stringify({ memberId: payload.receiverId }),
        },
      )
      .getOne();

    if (existingChat) {
      return existingChat;
    }

    // If no chat exists, create a new one
    const newChat = this.chatRepository.create({
      members: [
        { memberId: payload.senderId, member_type: payload?.senderType },
        { memberId: payload.receiverId, member_type: payload?.receiverType },
      ],
    });

    const savedChat = await this.chatRepository.save(newChat);
    return savedChat;
  }

  async postMessage(chatRoom: Chat, payload: PostMessageDTO) {
    // First check chat room

    const newMessage = this.messageRepository.create({
      receiver_id: payload.receiverId,
      sender_id: payload?.senderId,
      message: payload?.message,
      created_at: new Date(),
      updated_at: new Date(),
    });

    newMessage.chat = chatRoom;
    const savedMessage = await this.messageRepository.save(newMessage);

    chatRoom.last_message = savedMessage;
    await this.chatRepository.save(chatRoom);
    return savedMessage;
  }

  async userChats(userType: ChatMemberType, userId: string) {
    if (userType === ChatMemberType.CUSTOMER) {
      // Now check the customer repository here
      const foundCustomer = await this.customerRepository.findOne({
        where: { id: userId },
      });

      if (foundCustomer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }

      return this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.last_message', 'last_message')
        .where("JSON_SEARCH(chat.members, 'one', :userId) IS NOT NULL", {
          userId,
        })
        .getMany();
    } else if (userType === ChatMemberType.RIDER) {
      // Now check the customer repository here
      const foundRider = await this.riderRepository.findOne({
        where: { id: userId },
      });

      if (foundRider) {
        throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
      }

      return this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.last_message', 'last_message')
        .where("JSON_SEARCH(chat.members, 'one', :userId) IS NOT NULL", {
          userId,
        })
        .getMany();
    } else if (userType === ChatMemberType.VENDOR_LOCATION) {
      // Now check the customer repository here
      const foundVendor = await this.vendorLocationRepository.findOne({
        where: { id: userId },
      });

      if (foundVendor) {
        throw new HttpException(
          'Vendor location not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.last_message', 'last_message')
        .where("JSON_SEARCH(chat.members, 'one', :userId) IS NOT NULL", {
          userId,
        })
        .getMany();
    }
  }
}
