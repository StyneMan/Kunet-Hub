import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { PaystackPaymentLinkDTO } from 'src/bank/dtos/paystack.payment.init.dto';
import { Admin } from 'src/entities/admin.entity';
import { Customer } from 'src/entities/customer.entity';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { generateOTP } from 'src/utils/otp_generator';
import generateRandomPassword from 'src/utils/password_generator';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { PaystackPayoutDTO } from './dtos/payout.dto';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { OrdersService } from 'src/orders/orders.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UserType } from 'src/enums/user.type.enum';
import { PayCardOrderDTO } from 'src/bank/dtos/pay.card.order.dto';
import { Order } from 'src/entities/order.entity';
import { OrderType } from 'src/enums/order.type.enum';
import { orderConfirmationEmail } from 'src/utils/order_confirmation_mail';
import { Cart } from 'src/entities/cart.entity';
import { DummyOrder } from 'src/entities/dummy.order.entity';

export class PaystackService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerWallet)
    private customerWalletRepository: Repository<CustomerWallet>,
    @InjectRepository(CustomerTransactions)
    private customerTransactionRepository: Repository<CustomerTransactions>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(DummyOrder)
    private dummyOrderRepository: Repository<DummyOrder>,
    private socketGateway: SocketGateway,
    private orderService: OrdersService,
    private readonly mailerService: MailerService,
  ) {}

  async paystackPayout(input: PaystackPayoutDTO) {
    if (!input) {
      throw new HttpException('Payload not provided.', HttpStatus.BAD_REQUEST);
    }

    const secKey = '';
    const otp = generateOTP();
    const numGen = generateRandomPassword();

    return await axios.post(
      'https://api.paystack.co/v3/transfers',
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

  async initializeTransaction(
    secretKey: string,
    payload: PaystackPaymentLinkDTO,
  ) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: payload?.email_address,
        amount: payload?.amount * 100,
        channels: ['card', 'bank', 'ussd'],
        callback_url: 'https://myserver.myfastbuy.com/api/v1/paystack/success',
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('PAYSTACK TRANSACTION INIT RESPONSE ::: ', response.data);
    const customer = await this.customerRepository.findOne({
      where: { id: payload?.customer_id },
    });

    // Create a ne transaction here
    const transaction = this.customerTransactionRepository.create({
      amount: payload?.amount,
      fee: 0,
      status: 'pending',
      transaction_type: TransactionType.CREDIT,
      tx_ref: `FBW-${response.data?.data?.reference}`,
      summary: `Wallet topup for customer (${customer?.first_name} ${customer?.last_name})`,
      created_at: new Date(),
      updated_at: new Date(),
    });
    transaction.customer = customer;
    await this.customerTransactionRepository.save(transaction);

    return response.data;
  }

  async paystackPayWithCard(secretKey: string, payload: PayCardOrderDTO) {
    try {
      console.log('PAYLOADDD ', payload);

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: payload?.paymentInfo?.email_address,
          amount: parseInt(`${payload?.paymentInfo?.amount * 100}`),
          channels: ['card', 'bank', 'ussd'],
          callback_url:
            'https://myserver.myfastbuy.com/api/v1/paystack/success',
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      // // Create a new order here
      const randCode = generateOTP(4);
      const order = await this.orderService.createDummyOrder(
        `${response.data?.data?.reference}`,
        randCode,
        payload?.userType,
        payload?.orderInfo,
      );

      console.log('CREATE ORDER RESPONSE :: ', order);

      return response.data;
    } catch (error) {
      console.log('PAYSTACK ERR ::: ', error);
    }
  }

  // WEBHOOK ACTION
  async paystackTopupWallet(data: any, transaction: CustomerTransactions) {
    // Now update the transaction here and give customer wallet value afterwardds
    transaction.amount = data?.amount / 100;
    transaction.fee = data?.fees / 100;
    transaction.status = data?.status;
    transaction.completed_at = data?.paidAt;
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
    wallet.balance = wallet.balance + transaction.amount;
    wallet.updated_at = new Date();

    const updatedWallet = await this.customerWalletRepository.save(wallet);

    this.socketGateway.sendEvent(
      transaction?.customer?.id,
      UserType.CUSTOMER,
      'refresh-wallet',
      {},
    );

    return {
      message: 'Wallet topup successfully',
      data: updatedWallet,
    };
  }

  // WEBHOOK ACTION
  async paystackCardPayHook(data: any) {
    // First find transaction by tx-ref
    const dummyOrder = await this.dummyOrderRepository.findOne({
      where: { order_id: data?.reference },
      relations: ['customer', 'vendor_location', 'vendor', 'operator'],
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

        // now send order confirmation email here

        await this.mailerService.sendMail({
          to: customer?.email_address,
          subject: 'Order Confirmation Email',
          html: orderConfirmationEmail({
            amount: order?.total_amount,
            amountPaid: parseInt(`${data?.amount / 100}`),
            deliveryType: order?.delivery_type,
            items: order?.items,
            orderNum: order?.order_id,
            paymentMethod: order?.payment_method,
            deliveryFee: order?.delivery_fee,
            fullName: `${customer?.first_name} ${customer?.last_name}`,
            vendorName: 'FastBuy Team',
            receiverName: order?.receiver?.name,
            serviceCharge: 0,
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
          addOns: dummyOrder?.addOns,
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
        order.vendor_location = dummyOrder?.vendor_location;
        order.vendor = dummyOrder?.vendor;
        await this.orderRepository.save(order);

        // Send order email here
        const vendorName =
          order?.vendor?.name + ' ' + order?.vendor_location?.branch_name;
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
            receiverName:
              order?.customer?.first_name + ' ' + order?.customer?.last_name,
            serviceCharge: order.service_charge ?? 0,
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
}
