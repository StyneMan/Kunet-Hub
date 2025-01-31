import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entities/chat.entity';
import { ChatMessage } from 'src/entities/chat.message.entity';
import { Customer } from 'src/entities/customer.entity';
import { Rider } from 'src/entities/rider.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(Customer)
    private customertRepository: Repository<Customer>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}
}
