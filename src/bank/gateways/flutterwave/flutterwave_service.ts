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
// import generateRandomPassword from 'src/utils/password_generator';
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
import { FlutterwavePaymentLinkDTO } from 'src/bank/dtos/flutterwave.payment.dto';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { Customer } from 'src/entities/customer.entity';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { OrdersService } from 'src/orders/orders.service';
import { PayCardOrderDTO } from 'src/bank/dtos/pay.card.order.dto';
import { Order } from 'src/entities/order.entity';
import { generateOrderNo } from 'src/utils/order_num_generator';
import generateRandomCoupon from 'src/utils/coupon_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderType } from 'src/enums/order.type.enum';
import { orderConfirmationEmail } from 'src/utils/order_confirmation_mail';
import { Operator } from 'src/entities/operator.entity';
import { Cart } from 'src/entities/cart.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';
import { NotificationService } from 'src/notification/notification.service';
import { PushNotificationType } from 'src/enums/push.notification.type.enum';

export class FlutterwaveService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(DummyOrder)
    private dummyOrderRepository: Repository<DummyOrder>,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(RiderBank)
    private riderBankRepository: Repository<RiderBank>,
    @InjectRepository(VendorBank)
    private vendorBankRepository: Repository<VendorBank>,
    @InjectRepository(RiderWallet)
    private riderWalletRepository: Repository<RiderWallet>,
    @InjectRepository(VendorWallet)
    private vendorWalletRepository: Repository<VendorWallet>,
    @InjectRepository(CustomerWallet)
    private customerWalletRepository: Repository<CustomerWallet>,
    @InjectRepository(RiderPayoutRequest)
    private riderPayoutRequestRepository: Repository<RiderPayoutRequest>,
    @InjectRepository(VendorPayoutRequest)
    private vendorPayoutRequestRepository: Repository<VendorPayoutRequest>,
    @InjectRepository(RiderTransactions)
    private riderTransactionRepository: Repository<RiderTransactions>,
    @InjectRepository(VendorTransactions)
    private vendorTransactionRepository: Repository<VendorTransactions>,
    @InjectRepository(CustomerTransactions)
    private customerTransactionRepository: Repository<CustomerTransactions>,
    private socketGateway: SocketGateway,
    private orderService: OrdersService,
    private readonly mailerService: MailerService,
    private readonly notificationservice: NotificationService,
  ) {}

  async flutterwavePayout(input: FlutterwavePayoutDTO, secretKey: string) {
    if (!input) {
      throw new HttpException('Payload not provided.', HttpStatus.BAD_REQUEST);
    }

    // const secKey = '';
    const otp = generateOTP();
    // const numGen = generateRandomPassword();

    try {
      return await axios.post(
        'https://api.flutterwave.com/v3/transfers',
        {
          account_bank: input?.account_bank,
          account_number: input.account_number,
          amount: input.amount,
          narration: `Transfer to ${input.user_type}\'s account`,
          currency: input.currency,
          reference: `mfsb_${otp}_${v4()}`,
          callback_url:
            'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
          debit_currency: 'NGN',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secretKey}`,
          },
        },
      );
    } catch (error) {
      throw new HttpException(
        {
          message: `${
            error?.response?.data?.message ||
            error?.data?.response?.data?.message ||
            error?.data?.message ||
            'an error occurred'
          }`,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async flutterwaveWalletFunding(
    secretKey: string,
    payload: FlutterwavePaymentLinkDTO,
  ) {
    // try {
    const reference = `FBW-${generateRandomCoupon(4, payload?.full_name)}_${payload?.customer_id}`;
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: reference,
        amount: payload?.amount,
        currency: 'NGN',
        redirect_url: 'https://myfastbuy.com/success',
        payment_options: 'ussd, card, barter',
        customer: {
          email: payload?.email_address,
          name: payload?.full_name,
          phonenumber: payload?.phone_number,
        },
        customizations: {
          title: payload?.title,
          description: `Payment for ${payload?.title}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const customer = await this.customerRepository.findOne({
      where: { id: payload?.customer_id },
    });

    // Create a new transaction here
    const transaction = this.customerTransactionRepository.create({
      amount: payload?.amount,
      fee: 0,
      status: 'pending',
      transaction_type: TransactionType.CREDIT,
      tx_ref: reference,
      summary: `Wallet topup for customer (${customer?.first_name} ${customer?.last_name})`,
      created_at: new Date(),
      updated_at: new Date(),
    });
    transaction.customer = customer;
    await this.customerTransactionRepository.save(transaction);
    return response.data;
  }

  // PLACE ORDER WITH CARD
  async flutterwavePaywithCard(secretKey: string, payload: PayCardOrderDTO) {
    const customer = await this.customerRepository.findOne({
      where: { id: payload?.paymentInfo?.customer_id },
    });

    if (!customer) {
      throw new HttpException('No customer record found', HttpStatus.NOT_FOUND);
    }
    const randCode = generateOTP(4);
    const orderReference = await generateOrderNo(randCode);
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: orderReference,
        amount: payload?.paymentInfo?.amount,
        currency: 'NGN',
        redirect_url: 'https://myfastbuy.com/success',
        payment_options: 'ussd, card, barter',
        customer: {
          email: payload?.paymentInfo?.email_address,
          name: payload?.paymentInfo?.full_name,
          phonenumber: payload?.paymentInfo?.phone_number,
        },
        customizations: {
          title: payload?.paymentInfo?.title,
          description: `Payment for ${payload?.paymentInfo?.title}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // // Create a new order here
    const order = await this.orderService.createDummyOrder(
      orderReference,
      randCode,
      payload?.userType,
      payload?.orderInfo,
    );

    console.log('CREATE ORDER RESPONSE :: ', order);
    return response.data;
  }

  // WEBHOOK ACTION
  async flutterwaveTopupWallet(data: any) {
    // First find transaction by tx-ref
    const transaction = await this.customerTransactionRepository.findOne({
      where: { tx_ref: data?.tx_ref },
      relations: ['customer'],
    });

    if (!transaction) {
      throw new HttpException('No transaction found.', HttpStatus.NOT_FOUND);
    }

    // Now update the transaction here and give customer wallet value afterwardds
    transaction.amount = data?.charged_amount;
    transaction.fee = data?.app_fee;
    transaction.status = data?.status;
    transaction.completed_at = new Date();
    transaction.updated_at = new Date();

    await this.customerTransactionRepository.save(transaction);

    // Now find customer wallet and upddatte value;
    const wallet = await this.customerWalletRepository.findOne({
      where: { customer: { id: transaction.customer.id } },
    });

    if (!wallet) {
      throw new HttpException(
        'No wallet found for customer',
        HttpStatus.NOT_FOUND,
      );
    }

    wallet.prev_balance = wallet.balance;
    wallet.balance = wallet.balance + data?.charged_amount;
    wallet.updated_at = new Date();

    const updatedWallet = await this.customerWalletRepository.save(wallet);

    this.socketGateway.sendEvent(
      transaction?.customer?.id,
      UserType.CUSTOMER,
      'refresh-wallet',
      {},
    );

    try {
      await this.notificationservice.sendPushNotification(
        transaction?.customer?.fcmToken,
        {
          message: `Wallet funded successfully`,
          notificatioonType: PushNotificationType.SYSTEM,
          title: 'Wallet Topup',
          itemId: updatedWallet?.id,
        },
      );
    } catch (error) {
      console.log('ERROR :: ', error);
    }

    return {
      message: 'Wallet topup successfully',
      data: updatedWallet,
    };
  }

  // WEBHOOK ACTION
  async flutterwaveCardPayHook(data: any) {
    // First find transaction by tx-ref
    const dummyOrder = await this.dummyOrderRepository.findOne({
      where: { order_id: data?.tx_ref },
      relations: ['customer', 'vendor', 'vendor_location', 'operator'],
    });

    console.log('CHECKING DATA FROM WEBHOOK :::', data);
    console.log('CHECKING DUMMY ORDER FROM WEBHOOK :::', dummyOrder);

    if (!dummyOrder) {
      throw new HttpException('No order found.', HttpStatus.NOT_FOUND);
    }

    // Now Check if it's from customer or operator
    if (dummyOrder?.customer) {
      const customer = await this.customerRepository.findOne({
        where: { id: dummyOrder?.customer?.id },
      });

      if (!customer) {
        return;
      }
      // Now check the order type and other info
      if (dummyOrder?.order_type === OrderType.PARCEL_ORDER) {
        // Send order email here
        // Now create the real order here andd delete dummy order
        const order = this.orderRepository.create({
          access_code: dummyOrder?.access_code,
          coupon_discount: dummyOrder?.coupon_discount,
          delivery_addr_lat: dummyOrder?.delivery_addr_lat,
          delivery_addr_lng: dummyOrder?.delivery_addr_lng,
          delivery_address: dummyOrder?.delivery_address,
          delivery_fee: dummyOrder?.delivery_fee,
          delivery_time: dummyOrder?.delivery_time,
          delivery_type: dummyOrder?.delivery_type,
          items: dummyOrder?.items,
          order_delivered_at: dummyOrder?.order_delivered_at,
          order_id: dummyOrder?.order_id,
          order_status: dummyOrder?.order_status,
          paid_at: new Date(),
          receiver: dummyOrder?.receiver,
          order_type: dummyOrder?.order_type,
          payment_method: dummyOrder?.payment_method,
          pickup_addr_lat: dummyOrder?.pickup_addr_lat,
          pickup_addr_lng: dummyOrder?.pickup_addr_lng,
          pickup_address: dummyOrder?.pickup_address,
          rider_commission: dummyOrder?.rider_commission,
          rider_note: dummyOrder?.rider_note,
          service_charge: dummyOrder?.service_charge,
          shipping_type: dummyOrder?.shipping_type,
          total_amount: dummyOrder?.total_amount,
          vendor_note: dummyOrder?.vendor_note,
          variations: dummyOrder?.variations,
          created_at: new Date(),
          updated_at: new Date(),
        });

        order.customer = dummyOrder?.customer;
        await this.orderRepository.save(order);

        try {
          await this.notificationservice.sendPushNotification(
            customer?.fcmToken,
            {
              message: `Order placed successfully`,
              notificatioonType: PushNotificationType.ORDER,
              title: 'Order Placed',
              itemId: order?.id,
            },
          );
        } catch (error) {
          console.log('ERROR :: ', error);
        }

        // now send order confirmation email here
        await this.mailerService.sendMail({
          to: customer?.email_address,
          subject: 'Order Confirmation Email',
          html: orderConfirmationEmail({
            amount: order?.total_amount,
            amountPaid: parseInt(`${data?.amount ?? data?.charged_amount}`),
            deliveryType: order?.delivery_type,
            items: order?.items,
            orderNum: order?.order_id,
            paymentMethod: order?.payment_method,
            deliveryFee: order?.delivery_fee,
            fullName: `${customer?.first_name} ${customer?.last_name}`,
            vendorName: 'FastBuy Team',
            receiverName: order?.receiver?.name,
            serviceCharge: order?.service_charge ?? 0,
            deliveryAddress: order?.delivery_address,
            orderDate: new Date(`${order.created_at}`).toLocaleString('en-US'),
          }),
        });
      } else {
        // Clear the cart here
        const cart = await this.cartRepository.findOne({
          where: {
            customer: { id: customer?.id },
            vendor_location: { id: dummyOrder?.vendor_location?.id },
          },
        });

        if (!cart) {
          throw new HttpException('Cart not found!', HttpStatus.NOT_FOUND);
        }

        await this.cartRepository.remove(cart);
        this.socketGateway.sendEvent(
          customer?.id,
          UserType.CUSTOMER,
          'refresh-cart',
          {},
        );

        // Now create the real order here andd delete dummy order
        const order = this.orderRepository.create({
          access_code: dummyOrder?.access_code,
          addOns: dummyOrder?.addOns,
          coupon_discount: dummyOrder?.coupon_discount,
          delivery_addr_lat: dummyOrder?.delivery_addr_lat,
          delivery_addr_lng: dummyOrder?.delivery_addr_lng,
          delivery_address: dummyOrder?.delivery_address,
          delivery_fee: dummyOrder?.delivery_fee,
          delivery_time: dummyOrder?.delivery_time,
          delivery_type: dummyOrder?.delivery_type,
          items: dummyOrder?.items,
          order_delivered_at: dummyOrder?.order_delivered_at,
          order_id: dummyOrder?.order_id,
          order_status: dummyOrder?.order_status,
          paid_at: new Date(),
          receiver: dummyOrder?.receiver,
          order_type: dummyOrder?.order_type,
          payment_method: dummyOrder?.payment_method,
          pickup_addr_lat: dummyOrder?.pickup_addr_lat,
          pickup_addr_lng: dummyOrder?.pickup_addr_lng,
          pickup_address: dummyOrder?.pickup_address,
          rider_commission: dummyOrder?.rider_commission,
          rider_note: dummyOrder?.rider_note,
          service_charge: dummyOrder?.service_charge,
          shipping_type: dummyOrder?.shipping_type,
          total_amount: dummyOrder?.total_amount,
          vendor_note: dummyOrder?.vendor_note,
          variations: dummyOrder?.variations,
          created_at: new Date(),
          updated_at: new Date(),
        });

        order.customer = dummyOrder?.customer;
        order.vendor_location = dummyOrder?.vendor_location;
        order.vendor = dummyOrder?.vendor;
        await this.orderRepository.save(order);

        // Send order email here
        const vendorName =
          order?.vendor?.name + ' ' + order?.vendor_location?.branch_name;

        try {
          await this.notificationservice.sendPushNotification(
            customer?.fcmToken,
            {
              message: `Order placed successfully`,
              notificatioonType: PushNotificationType.ORDER,
              title: 'Order Placed',
              itemId: order?.id,
            },
          );
        } catch (error) {
          console.log('ERROR :: ', error);
        }

        // now send order confirmation email here
        await this.mailerService.sendMail({
          to: customer?.email_address,
          subject: 'Order Confirmation Email',
          html: orderConfirmationEmail({
            amount: order?.total_amount,
            amountPaid: parseInt(`${data?.amount ?? data?.charged_amount}`),
            deliveryType: order?.delivery_type,
            items: order?.items,
            orderNum: order?.order_id,
            paymentMethod: order?.payment_method,
            deliveryFee: order?.delivery_fee,
            fullName: `${customer?.first_name} ${customer?.last_name}`,
            vendorName: vendorName,
            receiverName: order?.receiver?.name,
            serviceCharge: order?.service_charge ?? 0,
            deliveryAddress: order?.delivery_address,
            orderDate: new Date(`${order.created_at}`).toLocaleString('en-US'),
          }),
        });
      }

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {},
      );

      return dummyOrder;
    }
  }

  async payoutRider(
    emai_address: string,
    payload: PayoutRiderDTO,
    secretKey: string,
  ) {
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
    const payoutResp = await this.flutterwavePayout(
      {
        account_bank: request?.bank_info?.bank_code,
        account_number: request?.bank_info?.account_number,
        amount: request?.amount,
        beneficiary_name: request?.bank_info?.account_name,
        currency: 'NGN',
        user_type: UserType?.RIDER,
      },
      secretKey,
    );

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

  async payoutVendor(
    emai_address: string,
    payload: PayoutVendorDTO,
    secretKey: string,
  ) {
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
    const payoutResp = await this.flutterwavePayout(
      {
        account_bank: request?.bank_info?.bank_code,
        account_number: request?.bank_info?.account_number,
        amount: request?.amount,
        beneficiary_name: request?.bank_info?.account_name,
        currency: 'NGN',
        user_type: UserType?.OPERATOR,
      },
      secretKey,
    );

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
