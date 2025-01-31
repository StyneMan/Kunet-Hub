import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { PaystackPaymentLinkDTO } from 'src/bank/dtos/paystack.payment.init.dto';
import { Admin } from 'src/entities/admin.entity';
import { Customer } from 'src/entities/customer.entity';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { Repository } from 'typeorm';

export class PaystackService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerTransactions)
    private customerTransactionRepository: Repository<CustomerTransactions>,
  ) {}

  async initializeTransaction(
    secretKey: string,
    payload: PaystackPaymentLinkDTO,
  ) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: payload?.email_address,
        amount: payload?.amount,
        channels: ['card', 'bank', 'ussd'],
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }
}
//     // Create transaction here
//     await new this.transactionRepository({
//       amount: Math.floor(amount / 100),
//       description: response.data?.message ?? '',
//       user: usr?._id,
//       status: 'pending',
//       trans_ref: response.data?.data?.reference,
//       type: TransactionType.TOPUP,
//       created_at: new Date(),
//       updated_at: new Date(),
//     }).save();

//     console.log('RESPONSE :: ', response.data);

//     return response.data;
//   }

//   async createTransaction(payload: CreateOrderDTO, email_address: string) {
//     //First check if user exist and marketplace exists
//     const usr = await this.userRepository
//       .findOne({
//         email_address: email_address,
//       })
//       .lean()
//       .exec();
//     if (!usr) {
//       throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
//     }

//     // Check if this user has sufficient balance
//     if (usr?.wallet?.balance < payload?.amount) {
//       throw new HttpException(
//         {
//           status: HttpStatus.BAD_REQUEST,
//           message: 'Insufficient balance! Topup required.',
//         },
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     // Now ddeduct from user balance and create transaction
//     const reducedBal = usr?.wallet?.balance - parseInt(`${payload?.amount}`);
//     const updatedWallet: Wallet = {
//       balance: reducedBal,
//       prev_balance: usr?.wallet?.balance,
//       last_updated: new Date(),
//     };

//     await this.userRepository.findOneAndUpdate(
//       { email_address: usr?.email_address },
//       { $set: { wallet: updatedWallet } },
//     );

//     const newTransaction = await new this.transactionRepository({
//       amount: payload.amount,
//       description: payload.description,
//       user: usr?._id,
//       status: 'pending',
//       trans_ref: `Qfx-${new Date().getTime()}`,
//       type: TransactionType.CHARGE,
//       created_at: new Date(),
//       updated_at: new Date(),
//     }).save();

//     await new this.notificationsRepository({
//       category: 'order',
//       title: `You created a new order on ${Date.now().toLocaleString()}`,
//       user: usr?._id,
//     }).save();

//     const newOrder = await this.orderservice.createOrder(
//       {
//         amount: payload?.amount,
//         description: payload?.description,
//         items: payload?.items,
//         pickup_date: payload?.pickup_date,
//         service: payload?.service,
//         address: payload?.address,
//         delivery_fee: payload?.delivery_fee,
//         landmark: payload?.landmark,
//         delivery_type: payload?.delivery_type,
//       },
//       email_address,
//       newTransaction?.id ?? newTransaction?._id,
//     );

//     return {
//       message: 'Order created successfully',
//       data: newOrder,
//     };
//   }
// }
