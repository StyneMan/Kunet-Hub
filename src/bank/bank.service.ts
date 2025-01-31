import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/entities/operator.entity';
import { RiderBank } from 'src/entities/rider.bank.entity';
import { Rider } from 'src/entities/rider.entity';
import { VendorBank } from 'src/entities/vendor.bank.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Repository } from 'typeorm';
import { AddBankDTO } from './dtos/addbank.dto';
import { UpdateBankDTO } from './dtos/updatebank.dto';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { VerifyAccountDTO } from './dtos/verifyaccount.dto';
import { VendorPayoutRequest } from 'src/entities/vendor.payout.request.entity';
import { RiderPayoutRequest } from 'src/entities/rider.payout.request.entity';
import { RequestPayoutDTO } from './dtos/requestpayout.dto';
import { OperatorType } from 'src/enums/operator.type.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { OperatorOTP } from 'src/entities/otp.operator.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { PayoutStatus } from 'src/enums/payout-status.enum';
import { UserStatus } from 'src/enums/user.status.enum';
import { RiderOTP } from 'src/entities/otp.rider.entity';
import { FlutterwaveService } from './gateways/flutterwave/flutterwave_service';
import { PaystackService } from './gateways/paystack/paystack_service';
import { PaymentGateway } from 'src/entities/payment.gateway.entity';
import { PaymentGatewayType } from 'src/enums/payment.gateways.enum';
import { FlutterwavePaymentLinkDTO } from './dtos/flutterwave.payment.dto';
import { PaystackPaymentLinkDTO } from './dtos/paystack.payment.init.dto';
import { PayCardOrderDTO, PayWalletOrderDTO } from './dtos/pay.card.order.dto';
import { Customer } from 'src/entities/customer.entity';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { UserType } from 'src/enums/user.type.enum';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { OrdersService } from 'src/orders/orders.service';
import { generateOTP } from 'src/utils/otp_generator';
import { generateOrderNo } from 'src/utils/order_num_generator';
import { Cart } from 'src/entities/cart.entity';
import { orderConfirmationEmail } from 'src/utils/order_confirmation_mail';
import { PaymentMethod } from 'src/enums/payment-method.enum';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(RiderBank)
    private readonly riderBankRepository: Repository<RiderBank>,
    @InjectRepository(VendorBank)
    private readonly vendorBankRepository: Repository<VendorBank>,
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    @InjectRepository(OperatorOTP)
    private operatorOTPRepository: Repository<OperatorOTP>,
    @InjectRepository(RiderOTP)
    private riderOTPRepository: Repository<RiderOTP>,
    @InjectRepository(RiderWallet)
    private riderWalletRepository: Repository<RiderWallet>,
    @InjectRepository(VendorWallet)
    private vendorWalletRepository: Repository<VendorWallet>,
    @InjectRepository(CustomerWallet)
    private customerWalletRepository: Repository<CustomerWallet>,
    @InjectRepository(VendorPayoutRequest)
    private readonly vendorPayoutRepository: Repository<VendorPayoutRequest>,
    @InjectRepository(RiderPayoutRequest)
    private readonly riderPayoutRepository: Repository<RiderPayoutRequest>,
    @InjectRepository(PaymentGateway)
    private gatewayRepository: Repository<PaymentGateway>,
    @InjectRepository(CustomerTransactions)
    private customerTransactionRepository: Repository<CustomerTransactions>,
    @InjectRepository(RiderTransactions)
    private riderTransactionRepository: Repository<RiderTransactions>,
    @InjectRepository(VendorTransactions)
    private vendorTransactionRepository: Repository<VendorTransactions>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private mailerService: MailerService,
    private orderService: OrdersService,
    private flutterwaveService: FlutterwaveService,
    private paystackService: PaystackService,
    private socketGateway: SocketGateway,
  ) {}

  async addRiderBank(payload: AddBankDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    //Check if rider exists
    const rider = await this.riderRepository.findOne({
      where: { id: payload.ownerId },
    });

    if (!rider) {
      throw new HttpException(
        { message: 'Rider not found!', status: HttpStatus.NOT_FOUND },
        HttpStatus.BAD_REQUEST,
      );
    }

    // First check if this rider already has a bank account added
    const hasBank = await this.riderBankRepository.findOne({
      where: {
        owner: { id: rider?.id },
        bank_code: payload?.bankCode,
        account_number: payload?.accountNumber,
      },
      relations: ['owner'],
    });

    if (!hasBank) {
      const newBank = this.riderBankRepository.create({
        account_name: payload?.accountName,
        account_number: payload?.accountNumber,
        bank_code: payload?.bankCode,
        bank_name: payload?.bankName,
        created_at: new Date(),
        is_default: true,
      });

      newBank.owner = rider;
      await this.riderBankRepository.save(newBank);

      this.socketGateway.sendEvent(rider.id, UserType.RIDER, 'refresh-banks', {
        message: 'Bank account added ',
      });

      return {
        message: 'Bank added successfully',
      };
    } else {
      throw new HttpException(
        'Bank account already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addVendorBank(payload: AddBankDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    //Check if vendor exists
    const vendor = await this.vendorRepository.findOne({
      where: { id: payload.ownerId },
    });

    if (!vendor) {
      throw new HttpException(
        { message: 'Vendor not found!', status: HttpStatus.NOT_FOUND },
        HttpStatus.BAD_REQUEST,
      );
    }

    // First check if this owner already has a bank account added
    const hasBank = await this.vendorBankRepository.findOne({
      where: {
        owner: vendor,
      },
      relations: ['owner'],
    });

    if (!hasBank) {
      const newBank = this.vendorBankRepository.create({
        account_name: payload?.accountName,
        account_number: payload?.accountNumber,
        bank_code: payload?.bankCode,
        bank_name: payload?.bankName,
        created_at: new Date(),
        is_default: true,
      });

      newBank.owner = vendor;
      await this.vendorBankRepository.save(newBank);

      return {
        message: 'Bank account added successfully',
      };
    } else {
      const newBank = this.vendorBankRepository.create({
        account_name: payload?.accountName,
        account_number: payload?.accountNumber,
        bank_code: payload?.bankCode,
        bank_name: payload?.bankName,
        created_at: new Date(),
        is_default: false,
      });

      newBank.owner = vendor;
      await this.vendorBankRepository.save(newBank);

      return {
        message: 'Bank account added successfully',
      };
    }
  }

  async allRiderBanks(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderBankRepository
        .createQueryBuilder('bank') // Alias for the Admin table
        .leftJoinAndSelect('bank.owner', 'owner') //
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.riderBankRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async allVendorBanks(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorBankRepository
        .createQueryBuilder('bank') // Alias for the Admin table
        .leftJoinAndSelect('bank.owner', 'owner') //
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorBankRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async riderBanks(page: number, limit: number, riderId: string) {
    const rider = await this.riderRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new HttpException(
        {
          message: 'Rider not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoinAndSelect('bank.owner', 'owner') // Join the related product table
        .where('owner.id = :riderId', { riderId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.riderBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoin('bank.owner', 'owner') // Join the related vendor table
        .where('owner.id = :riderId', { riderId }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async vendorBanks(page: number, limit: number, vendorId: string) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        {
          message: 'Vendor not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoinAndSelect('bank.owner', 'owner') // Join the related product table
        .where('owner.id = :vendorId', { vendorId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.vendorBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoin('bank.owner', 'owner') // Join the related vendor table
        .where('owner.id = :vendorId', { vendorId }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async updateRiderBank(
    email_address: string,
    bankId: string,
    payload: UpdateBankDTO,
  ) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException(
        {
          message: 'Rider not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const bank = await this.riderBankRepository.findOne({
      where: { id: bankId },
    });

    if (!bank) {
      throw new HttpException(
        {
          message: 'Bank not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    bank.account_name = payload?.accountName ?? bank.account_name;
    bank.account_number = payload?.accountNumber ?? bank.account_number;
    bank.updated_at = new Date();

    const updatedCart = await this.riderBankRepository.save(bank);
    this.socketGateway.sendEvent(rider.id, UserType.RIDER, 'refresh-banks', {
      message: 'Bank account added ',
    });

    return {
      message: 'Updated bank successfully',
      data: updatedCart,
    };
  }

  async deleteRiderBank(email_address: string, bankId: string) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException(
        {
          message: 'Rider not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const bank = await this.riderBankRepository.findOne({
      where: { id: bankId },
    });

    if (!bank) {
      throw new HttpException(
        {
          message: 'Bank not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.riderBankRepository.delete({ id: bankId });
    this.socketGateway.sendEvent(rider.id, UserType.RIDER, 'refresh-banks', {
      message: 'Bank account added ',
    });

    return {
      message: 'Bank account deleted successfully',
    };
  }

  async banks() {
    // const flutterwavePK = 'FLWPUBK_TEST-cdc2c2ed8554b768729bb2f94ab529e6-X';
    // const url = 'https://api.ravepay.co/v2/banks/NGN';
    // const ax = await axios.get(url, {
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer FLWSECK_TEST-79785fa8d1c4b8ff20e05eec9d7775c4-X',
    //   },
    // });

    // return ax.data;
    const resp = await axios.get(`https://api.flutterwave.com/v3/banks/NG`, {
      headers: {
        Authorization: 'Bearer FLWSECK_TEST-79785fa8d1c4b8ff20e05eec9d7775c4-X',
      },
    });

    // return resp.data;

    // Sorting banks alphabetically by name
    const sortedBanks = resp.data.data.sort((a: any, b: any) =>
      a?.name?.localeCompare(b?.name),
    );

    return {
      ...resp.data,
      data: sortedBanks,
    };
  }

  async verifyAccount(payload: VerifyAccountDTO) {
    if (!payload) {
      throw new HttpException(
        {
          message: 'Payload is missing!',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('PAYLOAD :::: ', payload);

    const resp = await axios.post(
      `https://api.flutterwave.com/v3/accounts/resolve`,
      {
        account_number: '0690000032', // payload?.accountNumber,
        account_bank: '044', // payload?.bankCode,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer FLWSECK_TEST-79785fa8d1c4b8ff20e05eec9d7775c4-X',
        },
      },
    );

    console.log('ACCOUNT INFORMATION ::: ', resp.data);

    return resp.data;
  }

  async findAllVendorBankAccounts(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorBankRepository
        .createQueryBuilder('bank')
        .leftJoinAndSelect('bank.owner', 'owner')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorBankRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findVendorBankAccounts(page: number, limit: number, vendorID: string) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorID },
    });

    if (!vendor) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Vendor not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorBankRepository
        .createQueryBuilder('bank')
        .leftJoinAndSelect('bank.owner', 'owner')
        .where('owner.id = :vendorID', { vendorID })
        .orderBy('bank.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.vendorBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoin('bank.owner', 'owner') // Join the related vendor table
        .where('owner.id = :vendorID', { vendorID }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findAllRiderBankAccounts(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderBankRepository
        .createQueryBuilder('bank')
        .leftJoinAndSelect('bank.owner', 'owner')
        .orderBy('bank.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.riderBankRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findRiderBankAccounts(page: number, limit: number, riderID: string) {
    const rider = await this.riderRepository.findOne({
      where: { id: riderID },
    });

    if (!rider) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Rider not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderBankRepository
        .createQueryBuilder('bank')
        .leftJoinAndSelect('bank.owner', 'owner')
        .where('owner.id = :riderID', { riderID })
        .orderBy('bank.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.riderBankRepository
        .createQueryBuilder('bank') // Alias for the table
        .leftJoin('bank.owner', 'owner') // Join the related vendor table
        .where('owner.id = :riderID', { riderID }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async requestVendorPayout(email_address: string, payload: RequestPayoutDTO) {
    // First check if user is legit
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });

    if (!operator || operator.status === UserStatus.DELETED) {
      throw new HttpException(
        { message: 'Operator not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        { message: 'You are forbidden!', status: HttpStatus.FORBIDDEN },
        HttpStatus.FORBIDDEN,
      );
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        { message: 'Vendor not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now check wallet balance
    const wallet = await this.vendorWalletRepository.findOne({
      where: { id: payload?.walletId },
    });

    if (!wallet) {
      throw new HttpException(
        { message: 'Vendor wallet not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (wallet?.balance <= payload?.amount) {
      throw new HttpException(
        {
          message: 'Insufficient funds in vendor wallet',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Now bank account
    const bankAccount = await this.vendorBankRepository.findOne({
      where: { id: payload?.accountId },
    });

    if (!bankAccount) {
      throw new HttpException(
        {
          message: 'Vendor bank account not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // verify OTP first
    const otpDb = await this.operatorOTPRepository.findOne({
      where: { user: { email_address: email_address } },
      relations: ['user'],
    });

    if (!otpDb) {
      throw new HttpException(
        {
          message: 'OTP data not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now compare this otp code and the one saved to the database
    if (otpDb?.code !== payload.otpCode) {
      throw new HttpException(
        {
          message: 'OTP code not valid',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (otpDb.expired || new Date() > otpDb.expires_at) {
      // Mark OTP as expired in the database for consistency
      otpDb.expired = true;
      await this.operatorOTPRepository.save(otpDb);

      throw new HttpException(
        {
          message: 'OTP code has expired',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // await this.otpService.removeOtp(otpDb?.id);
    await this.operatorOTPRepository.delete({ id: otpDb?.id });

    // Now proceed to make request
    const payoutRequest = this.vendorPayoutRepository.create({
      amount: payload?.amount,
      status: PayoutStatus.SUBMITTED,
      created_at: new Date(),
      updated_at: new Date(),
    });
    payoutRequest.vendor = vendor;
    payoutRequest.wallet = wallet;
    payoutRequest.bank_info = bankAccount;

    const savedRequest = await this.vendorPayoutRepository.save(payoutRequest);

    return {
      message: 'Payout request sent successfully',
      data: savedRequest,
    };
  }

  async requestRiderPayout(email_address: string, payload: RequestPayoutDTO) {
    // First check if user is legit
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider || rider.status === UserStatus.DELETED) {
      throw new HttpException(
        { message: 'Dispatch rider not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!rider.is_kyc_completed) {
      throw new HttpException(
        {
          message: 'Forbidden. You must complete your KYC!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (rider.status !== UserStatus.ACTIVE) {
      throw new HttpException(
        {
          message: 'Forbidden. Your account must be active',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now check wallet balance
    const wallet = await this.riderWalletRepository.findOne({
      where: { id: payload?.walletId },
    });

    if (!wallet) {
      throw new HttpException(
        { message: 'Rider wallet not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (wallet?.balance <= payload?.amount) {
      throw new HttpException(
        {
          message: 'Insufficient funds in your wallet',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now check bank account
    const bankAccount = await this.riderBankRepository.findOne({
      where: { id: payload?.accountId },
    });

    if (!bankAccount) {
      throw new HttpException(
        {
          message: 'Rider bank account not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // verify OTP first
    const otpDb = await this.riderOTPRepository.findOne({
      where: { user: { email_address: email_address } },
      relations: ['user'],
    });

    if (!otpDb) {
      throw new HttpException(
        {
          message: 'OTP data not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now compare this otp code and the one saved to the database
    if (otpDb?.code !== payload.otpCode) {
      throw new HttpException(
        {
          message: 'OTP code not valid',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (otpDb.expired || new Date() > otpDb.expires_at) {
      // Mark OTP as expired in the database for consistency
      otpDb.expired = true;
      await this.riderOTPRepository.save(otpDb);

      throw new HttpException(
        {
          message: 'OTP code has expired',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // await this.otpService.removeOtp(otpDb?.id);
    await this.riderOTPRepository.delete({ id: otpDb?.id });

    // Now proceed to make request
    const payoutRequest = this.riderPayoutRepository.create({
      amount: payload?.amount,
      status: PayoutStatus.SUBMITTED,
      created_at: new Date(),
      updated_at: new Date(),
    });
    payoutRequest.rider = rider;
    payoutRequest.wallet = wallet;
    payoutRequest.bank_info = bankAccount;

    const savedRequest = await this.riderPayoutRepository.save(payoutRequest);

    return {
      message: 'Payout request sent successfully',
      data: savedRequest,
    };
  }

  async allVendorPayoutRequests(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorPayoutRepository
        .createQueryBuilder('payout') // Alias for the Admin table
        .leftJoinAndSelect('payout.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('payout.bank_info', 'bank_info') // Join the related product table
        .leftJoinAndSelect('payout.wallet', 'wallet') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorPayoutRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async allRiderPayoutRequests(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderPayoutRepository
        .createQueryBuilder('payout') // Alias for the Admin table
        .leftJoinAndSelect('payout.rider', 'rider') // Join the related product table
        .leftJoinAndSelect('payout.bank_info', 'bank_info') // Join the related product table
        .leftJoinAndSelect('payout.wallet', 'wallet') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.riderPayoutRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async initFlutterwavePayment(payload: FlutterwavePaymentLinkDTO) {
    const gateway = await this.gatewayRepository.findOne({
      where: { provider: PaymentGatewayType.FLUTTER_WAVE },
    });

    if (!gateway) {
      throw new HttpException(
        {
          message: 'Flutterwave gateway not initialized',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.flutterwaveService.flutterwavePaymentLink(
      gateway.secret_key,
      payload,
    );
  }

  async initPaystackPayment(payload: PaystackPaymentLinkDTO) {
    const gateway = await this.gatewayRepository.findOne({
      where: { provider: PaymentGatewayType.PAYSTACK },
    });

    if (!gateway) {
      throw new HttpException(
        {
          message: 'Paystack gateway not found',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.paystackService.initializeTransaction(
      gateway.secret_key,
      payload,
    );
  }

  async flutterwaveWebHook(data: any) {
    return this.flutterwaveService.flutterwaveTopupWallet(data);
  }

  async flutterwaveCardWebHook(data: any) {
    return this.flutterwaveService.flutterwaveCardPayHook(data);
  }

  async flutterwaveOrderChargeCard(payload: PayCardOrderDTO) {
    const gateway = await this.gatewayRepository.findOne({
      where: { provider: PaymentGatewayType.FLUTTER_WAVE },
    });

    if (!gateway) {
      throw new HttpException(
        'Flutterwave gateway missing',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.flutterwaveService.flutterwavePaywithCard(
      gateway?.secret_key,
      payload,
    );
  }

  async orderWithWallet(email_address: string, payload: PayWalletOrderDTO) {
    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    // now check for wallet
    const wallet = await this.customerWalletRepository.findOne({
      where: { customer: { id: customer?.id } },
    });

    if (!wallet) {
      throw new HttpException(
        'Customer wallet not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      wallet &&
      (await bcrypt.compareSync(payload?.wallet_pin, customer?.wallet_pin))
    ) {
      // now process to deduct wallet then place order
      if (wallet?.balance > payload?.paymentInfo?.amount) {
        wallet.prev_balance = wallet.balance;
        wallet.balance = wallet.balance - payload?.paymentInfo?.amount;

        const updatedWallet = await this.customerWalletRepository.save(wallet);
        this.socketGateway.sendEvent(
          customer?.id,
          UserType.CUSTOMER,
          'refresh-wallet',
          {
            message: 'Refreshing wallet',
            data: updatedWallet,
          },
        );

        const randCode = generateOTP(4);
        const orderReference = await generateOrderNo(randCode);

        // Now create transaction
        const walletTransaction =
          await this.customerTransactionRepository.create({
            amount: payload?.paymentInfo?.amount,
            tx_ref: orderReference,
            fee: 0,
            summary: 'Order purchase with wallet',
            transaction_type: TransactionType.WITHDRAWAL,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          });
        walletTransaction.customer = customer;
        await this.customerTransactionRepository.save(walletTransaction);

        // Now create order here
        const newOrder = await this.orderService.createOrder(
          orderReference,
          randCode,
          payload?.userType,
          payload?.orderInfo,
        );

        console.log('CREATE ORDER RESPONSE :: ', newOrder);

        // Clear the cart here
        const cart = await this.cartRepository.findOne({
          where: {
            customer: { id: customer?.id },
            vendor: { id: payload?.orderInfo?.vendorId },
          },
        });

        if (!cart) {
          console.log('CART NOT FOUND');
          // throw new HttpException('Cart not found!', HttpStatus.NOT_FOUND);
        } else {
          await this.cartRepository.remove(cart);
          this.socketGateway.sendEvent(
            customer?.id,
            UserType.CUSTOMER,
            'refresh-cart',
            {
              message: 'HELLO TESTING SOCKET.IO !!!',
            },
          );
        }

        // Send order email here
        // now send order confirmation email here
        await this.mailerService.sendMail({
          to: customer?.email_address,
          subject: 'Order Confirmation Email',
          html: orderConfirmationEmail({
            amount: payload?.orderInfo?.amount,
            amountPaid: parseInt(`${payload?.paymentInfo?.amount}`),
            deliveryType: payload?.orderInfo?.deliveryType,
            items: payload?.orderInfo?.items,
            orderNum: orderReference,
            paymentMethod: PaymentMethod.Wallet,
            deliveryFee: payload?.orderInfo?.deliveryFee,
            fullName: `${customer?.first_name} ${customer?.last_name}`,
            vendorName: newOrder?.data?.vendor?.name ?? 'FastBuy Team',
            receiverName: payload?.orderInfo?.receiver?.name,
            serviceCharge: 0,
            deliveryAddress: payload?.orderInfo?.deliveryAddress,
            orderDate: new Date(`${newOrder?.data.created_at}`).toLocaleString(
              'en-US',
            ),
          }),
        });

        this.socketGateway.sendEvent(
          customer.id,
          UserType?.CUSTOMER,
          'refresh-orders',
          { message: 'Refreshing orders', order: newOrder },
        );

        return {
          message: 'Order successfully created',
          data: newOrder,
        };
      } else {
        throw new HttpException(
          'Insufficient wallet balance',
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      throw new HttpException('Incorrect wallet pin', HttpStatus.BAD_REQUEST);
    }
  }
}
