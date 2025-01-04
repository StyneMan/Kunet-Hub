import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayoutRiderDTO } from 'src/bank/dtos/payoutrider.dto';
import { Admin } from 'src/entities/admin.entity';
import { RiderBank } from 'src/entities/rider.bank.entity';
import { Rider } from 'src/entities/rider.entity';
import { RiderPayoutRequest } from 'src/entities/rider.payout.request.entity';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { UserStatus } from 'src/enums/user.status.enum';
import { Repository } from 'typeorm';
import { FlutterwavePayoutDTO } from './dtos/payout.dto';
import axios from 'axios';
import generateRandomPassword from 'src/utils/password_generator';
import { generateOTP } from 'src/utils/otp_generator';
import { v4 } from 'uuid';
import { UserType } from 'src/enums/user.type.enum';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { PayoutVendorDTO } from 'src/bank/dtos/payoutvendor.dto';
import { Vendor } from 'src/entities/vendor.entity';
import { VendorBank } from 'src/entities/vendor.bank.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { VendorPayoutRequest } from 'src/entities/vendor.payout.request.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { VendorStatus } from 'src/enums/vendor.status.enum';

export class FlutterwaveService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(RiderBank)
    private riderBankRepository: Repository<RiderBank>,
    @InjectRepository(VendorBank)
    private vendorBankRepository: Repository<VendorBank>,
    @InjectRepository(RiderWallet)
    private riderWalletRepository: Repository<RiderWallet>,
    @InjectRepository(VendorWallet)
    private vendorWalletRepository: Repository<VendorWallet>,
    @InjectRepository(RiderPayoutRequest)
    private riderPayoutRequestRepository: Repository<RiderPayoutRequest>,
    @InjectRepository(VendorPayoutRequest)
    private vendorPayoutRequestRepository: Repository<VendorPayoutRequest>,
    @InjectRepository(RiderTransactions)
    private riderTransactionRepository: Repository<RiderTransactions>,
    @InjectRepository(VendorTransactions)
    private vendorTransactionRepository: Repository<VendorTransactions>,
  ) {}

  async flutterwavePayout(input: FlutterwavePayoutDTO) {
    if (!input) {
      throw new HttpException('Payload not provided.', HttpStatus.BAD_REQUEST);
    }

    const secKey = '';
    const otp = generateOTP();
    const numGen = generateRandomPassword();

    return await axios.post(
      'https://api.flutterwave.com/v3/transfers',
      {
        account_bank: input?.account_bank,
        account_number: input.account_number,
        amount: input.amount,
        narration: `Transfer to ${input.user_type}\'s account`,
        currency: input.currency,
        reference: `mfsb_${numGen}_${otp}_${v4()}`,
        callback_url:
          'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
        debit_currency: 'NGN',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secKey}`,
        },
      },
    );
  }

  async payoutRider(emai_address: string, payload: PayoutRiderDTO) {
    // First find admin
    const adm = await this.adminRepository.findOne({
      where: { email_address: emai_address },
    });
    if (!adm) {
      throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
    }

    if (
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const rider = await this.riderRepository.findOne({
      where: { id: payload?.riderId },
    });
    if (!rider) {
      throw new HttpException('Rider record not found.', HttpStatus.NOT_FOUND);
    }

    if (rider.status !== UserStatus.ACTIVE) {
      throw new HttpException('Account not active.', HttpStatus.NOT_FOUND);
    }

    // Now check payout request
    const request = await this.riderPayoutRequestRepository.findOne({
      where: { id: payload?.requestId },
      relations: ['wallet', 'bank_info', 'rider'],
    });
    if (!request) {
      throw new HttpException(
        'Payout request  not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const bank = await this.riderBankRepository.findOne({
      where: { id: request?.bank_info?.id },
    });
    if (!bank) {
      throw new HttpException('Bank account not found.', HttpStatus.NOT_FOUND);
    }

    const wallet = await this.riderWalletRepository.findOne({
      where: { id: request?.wallet?.id },
    });
    if (!wallet) {
      throw new HttpException('Rider wallet not found.', HttpStatus.NOT_FOUND);
    }

    if (wallet.balance < request?.amount) {
      throw new HttpException(
        'Insufficient wallet balance.',
        HttpStatus.FORBIDDEN,
      );
    }

    //Now handle payout in flutterwave way
    const payoutResp = await this.flutterwavePayout({
      account_bank: request?.bank_info?.bank_code,
      account_number: request?.bank_info?.account_number,
      amount: request?.amount,
      beneficiary_name: request?.bank_info?.account_name,
      currency: 'NGN',
      user_type: UserType?.RIDER,
    });

    console.log('FLUTTER WAVE PAYOUT RESPONSE HERE :: ', payoutResp);

    // Now create transaction here and send email accorddingly
    const newTransaction = this.riderTransactionRepository.create({
      amount: request?.amount,
      status: payoutResp?.data?.data?.status ?? '',
      tx_ref: payoutResp?.data?.data?.reference,
      transaction_type: TransactionType.WITHDRAWAL,
      fee: payoutResp?.data?.data?.fee ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    newTransaction.rider = rider;

    const savedTransation =
      await this.riderTransactionRepository.save(newTransaction);
    // now send email to rider here

    return {
      message: 'Payout sent successfully',
      data: savedTransation,
    };
  }

  async payoutVendor(emai_address: string, payload: PayoutVendorDTO) {
    // First find admin
    const adm = await this.adminRepository.findOne({
      where: { email_address: emai_address },
    });
    if (!adm) {
      throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
    }

    if (
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });
    if (!vendor) {
      throw new HttpException('Vendor record not found.', HttpStatus.NOT_FOUND);
    }

    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException('Account not active.', HttpStatus.FORBIDDEN);
    }

    // Now check payout request
    const request = await this.vendorPayoutRequestRepository.findOne({
      where: { id: payload?.requestId },
      relations: ['wallet', 'bank_info', 'vendor'],
    });
    if (!request) {
      throw new HttpException(
        'Payout request  not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const bank = await this.vendorBankRepository.findOne({
      where: { id: request?.bank_info?.id },
    });
    if (!bank) {
      throw new HttpException('Bank account not found.', HttpStatus.NOT_FOUND);
    }

    const wallet = await this.vendorWalletRepository.findOne({
      where: { id: request?.wallet?.id },
    });
    if (!wallet) {
      throw new HttpException('Vendor wallet not found.', HttpStatus.NOT_FOUND);
    }

    if (wallet.balance < request?.amount) {
      throw new HttpException(
        'Insufficient wallet balance.',
        HttpStatus.FORBIDDEN,
      );
    }

    //Now handle payout in flutterwave way
    const payoutResp = await this.flutterwavePayout({
      account_bank: request?.bank_info?.bank_code,
      account_number: request?.bank_info?.account_number,
      amount: request?.amount,
      beneficiary_name: request?.bank_info?.account_name,
      currency: 'NGN',
      user_type: UserType?.OPERATOR,
    });

    console.log('FLUTTER WAVE PAYOUT RESPONSE HERE :: ', payoutResp);

    // Now create transaction here and send email accorddingly
    const newTransaction = this.vendorTransactionRepository.create({
      amount: request?.amount,
      status: payoutResp?.data?.data?.status ?? '',
      tx_ref: payoutResp?.data?.data?.reference,
      transaction_type: TransactionType.WITHDRAWAL,
      fee: payoutResp?.data?.data?.fee ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    newTransaction.vendor = vendor;

    const savedTransation =
      await this.vendorTransactionRepository.save(newTransaction);
    // now send email to vendor here

    return {
      message: 'Payout sent successfully',
      data: savedTransation,
    };
  }

  async payoutWebhook(data: any) {
    console.log(data);
  }
}
