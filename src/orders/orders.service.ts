import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Operator } from 'src/entities/operator.entity';
import { Order } from 'src/entities/order.entity';
import { UserType } from 'src/enums/user.type.enum';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { CreateOrderDTO } from './dtos/createorder.dto';
import { Vendor } from 'src/entities/vendor.entity';
import { UpdateOrderDTO } from './dtos/updateorder.dto';
import { Rider } from 'src/entities/rider.entity';
import { OrderType } from 'src/enums/order.type.enum';
import { OrderStatus } from 'src/enums/order.status.enum';
import { CalculateParcelCostDTO } from './dtos/calculate.parcel.cost.dto';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { ShippingType } from 'src/enums/shipping.type.enum';
import { CalculateDeliveryCostDTO } from './dtos/calculate.delivery.cost.dto';
// import { Client } from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { DeliveryType } from 'src/enums/delivery.type.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MailerService } from '@nestjs-modules/mailer';
import calculateDistance from 'src/commons/calculator/distance.calc';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(CommissionAndFee)
    private feesRepository: Repository<CommissionAndFee>,
    @InjectRepository(RiderTransactions)
    private riderTransactionRepository: Repository<RiderTransactions>,
    @InjectRepository(VendorTransactions)
    private vendorTransactionRepository: Repository<VendorTransactions>,
    @InjectRepository(SystemTransactions)
    private systemTransactionRepository: Repository<SystemTransactions>,
    @InjectRepository(RiderWallet)
    private riderWalletRepository: Repository<RiderWallet>,
    @InjectRepository(VendorWallet)
    private vendorWalletRepository: Repository<VendorWallet>,
    private mailerService: MailerService,
    private socketGateway: SocketGateway,
  ) {}

  async createOrder(
    orderId: string,
    accessCode: string,
    user_type: UserType,
    payload: CreateOrderDTO,
  ) {
    if (user_type === UserType.CUSTOMER) {
      if (!payload?.customerId) {
        throw new HttpException(
          {
            message: 'Customer ID is required',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const customer = await this.customerRepository.findOne({
        where: { id: payload?.customerId },
      });

      if (!customer) {
        throw new HttpException(
          {
            message: 'Customer with gven ID not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check for order type
      if (payload?.orderType === OrderType.PARCEL_ORDER) {
        // Parcel order creation here
        const newOrder = this.orderRepository.create({
          total_amount: payload?.amount,
          delivery_type: DeliveryType.DELIVERY,
          delivery_fee: payload?.deliveryFee,
          delivery_time: payload?.deliveryTime,
          receiver: payload?.receiver,
          pickup_addr_lat: payload?.pickupAddrLat,
          pickup_addr_lng: payload?.pickupAddrLng,
          pickup_address: payload?.pickupAddress,
          shipping_type: payload?.shippingType,
          payment_method: payload?.paymentMethod,
          rider_commission: payload?.riderCommission,
          rider_note: payload?.riderNote,
          order_status: OrderStatus.PENDING,
          delivery_addr_lat: payload?.deliveryAddrLat,
          delivery_addr_lng: payload?.deliveryAddrLng,
          delivery_address: payload?.deliveryAddress,
          items: payload?.items,
          access_code: accessCode,
          order_id: orderId,
          order_type: payload?.orderType,
          created_at: new Date(),
          updated_at: new Date(),
        });

        newOrder.customer = customer;
        const savedOrder = await this.orderRepository.save(newOrder);

        return {
          message: 'New order created successfully',
          data: savedOrder,
        };
      } else {
        // Other types of orders (Restaurant and Store)
        const vendor = await this.vendorRepository.findOne({
          where: { id: payload?.vendorId },
        });

        if (!vendor) {
          throw new HttpException(
            {
              message: 'Vendor not found',
              status: HttpStatus.NOT_FOUND,
            },
            HttpStatus.NOT_FOUND,
          );
        }

        if (vendor?.status !== VendorStatus.ACTIVE) {
          throw new HttpException(
            {
              message: 'Vendor not active',
              status: HttpStatus.FORBIDDEN,
            },
            HttpStatus.FORBIDDEN,
          );
        }

        const newOrder = this.orderRepository.create({
          total_amount: payload?.amount,
          delivery_type: DeliveryType.DELIVERY,
          delivery_fee: payload?.deliveryFee,
          delivery_time: payload?.deliveryTime,
          receiver: payload?.receiver,
          shipping_type: payload?.shippingType,
          payment_method: payload?.paymentMethod,
          rider_commission: payload?.riderCommission,
          rider_note: payload?.riderNote,
          order_status: OrderStatus.PENDING,
          delivery_addr_lat: payload?.deliveryAddrLat,
          delivery_addr_lng: payload?.deliveryAddrLng,
          delivery_address: payload?.deliveryAddress,
          items: payload?.items,
          access_code: accessCode,
          order_id: orderId,
          vendor_note: payload?.vendorNote,
          order_type: payload?.orderType,
          created_at: new Date(),
          updated_at: new Date(),
        });

        newOrder.customer = customer;
        newOrder.vendor = vendor;

        const savedOrder = await this.orderRepository.save(newOrder);

        return {
          message: 'New order created successfully',
          data: savedOrder,
        };
      }
    } else if (user_type === UserType.OPERATOR) {
      if (!payload?.operatorId) {
        throw new HttpException(
          {
            message: 'Operator ID is required',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const vendor = await this.vendorRepository.findOne({
        where: { id: payload?.vendorId },
      });

      if (!vendor) {
        throw new HttpException(
          {
            message: 'Vendor not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const operator = await this.operatorRepository.findOne({
        where: { id: payload?.operatorId },
      });

      if (!operator) {
        throw new HttpException(
          {
            message: 'Customer with gven ID not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (vendor?.status !== VendorStatus.ACTIVE) {
        throw new HttpException(
          {
            message: 'Vendor not active',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Check for order type
      if (payload?.orderType === OrderType.PARCEL_ORDER) {
        // Parcel order creation here
        const newOrder = this.orderRepository.create({
          total_amount: payload?.amount,
          delivery_type: DeliveryType.DELIVERY,
          delivery_fee: payload?.deliveryFee,
          delivery_time: payload?.deliveryTime,
          receiver: payload?.receiver,
          shipping_type: payload?.shippingType,
          payment_method: payload?.paymentMethod,
          rider_commission: payload?.riderCommission,
          rider_note: payload?.riderNote,
          order_status: OrderStatus.PENDING,
          delivery_addr_lat: payload?.deliveryAddrLat,
          delivery_addr_lng: payload?.deliveryAddrLng,
          delivery_address: payload?.deliveryAddress,
          items: payload?.items,
          access_code: accessCode,
          order_id: orderId,
          order_type: payload?.orderType,
          created_at: new Date(),
          updated_at: new Date(),
        });

        newOrder.operator = operator;
        const savedOrder = await this.orderRepository.save(newOrder);

        return {
          message: 'New order created successfully',
          data: savedOrder,
        };
      } else {
        // Other types of orders (Restaurant and Store)
        const vendor = await this.vendorRepository.findOne({
          where: { id: payload?.vendorId },
        });

        if (!vendor) {
          throw new HttpException(
            {
              message: 'Vendor not found',
              status: HttpStatus.NOT_FOUND,
            },
            HttpStatus.NOT_FOUND,
          );
        }

        if (vendor?.status !== VendorStatus.ACTIVE) {
          throw new HttpException(
            {
              message: 'Vendor not active',
              status: HttpStatus.FORBIDDEN,
            },
            HttpStatus.FORBIDDEN,
          );
        }

        const newOrder = this.orderRepository.create({
          total_amount: payload?.amount,
          delivery_type: DeliveryType.DELIVERY,
          delivery_fee: payload?.deliveryFee,
          delivery_time: payload?.deliveryTime,
          receiver: payload?.receiver,
          shipping_type: payload?.shippingType,
          payment_method: payload?.paymentMethod,
          rider_commission: payload?.riderCommission,
          rider_note: payload?.riderNote,
          order_status: OrderStatus.PENDING,
          delivery_addr_lat: payload?.deliveryAddrLat,
          delivery_addr_lng: payload?.deliveryAddrLng,
          delivery_address: payload?.deliveryAddress,
          items: payload?.items,
          access_code: accessCode,
          order_id: orderId,
          vendor_note: payload?.vendorNote,
          order_type: payload?.orderType,
          created_at: new Date(),
          updated_at: new Date(),
        });

        newOrder.operator = operator;
        newOrder.vendor = vendor;

        const savedOrder = await this.orderRepository.save(newOrder);
        return {
          message: 'New order created successfully',
          data: savedOrder,
        };
      }
    }
  }

  async updateOrder(order_id: string, payload: UpdateOrderDTO) {
    const order = await this.orderRepository.findOne({
      where: { id: order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (payload?.riderId) {
      // Now assign this order to a rider here
      const rider = await this.riderRepository.findOne({
        where: { id: payload?.riderId },
      });

      if (!rider) {
        throw new NotFoundException('Rider not found');
      }
      // Merge the payload into the existing product object
      const updatedOrder = this.orderRepository.create({
        ...order,
        ...payload,
      });

      updatedOrder.rider = rider;

      // Save the updated product
      const savedOrder = await this.orderRepository.save(order);

      return {
        message: 'Order updated successfully',
        data: savedOrder,
      };
    } else {
      // Merge the payload into the existing product object
      const updatedOrder = this.orderRepository.create({
        ...order,
        ...payload,
      });

      // Save the updated product
      const savedOrder = await this.orderRepository.save(updatedOrder);

      return {
        message: 'Order updated successfully',
        data: savedOrder,
      };
    }
  }

  async all(page: number, limit: number, order_type: OrderType) {
    if (order_type) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoinAndSelect('order.customer', 'customer') // Join the related product table
          .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
          .leftJoinAndSelect('order.rider', 'rider') // Join the related product table
          .where('order.order_type = :order_type', { order_type }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoin('order.customer', 'customer') // Join the related vendor table
          .leftJoin('order.vendor', 'vendor') // Join the related vendor table
          .leftJoin('order.rider', 'rider') // Join the related vendor table
          .where('order.order_type = :order_type', { order_type }) // Filter by vendor ID
          .getCount(), // Count total records for pagination
      ]);

      // Return the paginated response
      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        perPage: limit,
      };
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order') // Alias for the table
        .leftJoinAndSelect('order.customer', 'customer') // Join the related product table
        .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('order.rider', 'rider') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.orderRepository.count(), // Count total records for pagination
    ]);

    // Return the paginated response
    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async ordersByStatus(status: OrderStatus, page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order') // Alias for the table
        .leftJoinAndSelect('order.customer', 'customer') // Join the related product table
        .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('order.rider', 'rider') // Join the related product table
        .where('order.order_status = :status', { status }) // Filter by vendor ID
        .orderBy('orders.created_at', 'DESC') // Sort by created_at in descending order
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.orderRepository
        .createQueryBuilder('order') // Alias for the table
        .leftJoin('order.customer', 'customer') // Join the related vendor table
        .leftJoin('order.vendor', 'vendor') // Join the related vendor table
        .leftJoin('order.rider', 'rider') // Join the related vendor table
        .where('order.order_status = :status', { status }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    // Return the paginated response
    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async vendorOrders(
    vendorId: string,
    page: number,
    limit: number,
    status?: OrderStatus,
  ) {
    // First find this vendor first
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        {
          message: 'Vendor record not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (status) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoinAndSelect('order.customer', 'customer') // Join the related product table
          .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
          .leftJoinAndSelect('order.rider', 'rider') // Join the related product tabl
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .andWhere('order.order_status = :status', { status }) // Filter by vendor ID
          .orderBy('order.created_at', 'DESC') // Sort by created_at in descending order
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoin('order.customer', 'customer') // Join the related vendor table
          .leftJoin('order.vendor', 'vendor') // Join the related vendor table
          .leftJoin('order.rider', 'rider') // Join the related vendor table
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .andWhere('order.order_status = :status', { status }) // Filter by vendor ID
          .getCount(), // Count total records for pagination
      ]);

      // Return the paginated response
      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        perPage: limit,
      };
    } else {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoinAndSelect('order.customer', 'customer') // Join the related product table
          .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
          .leftJoinAndSelect('order.rider', 'rider') // Join the related product table
          // .select([
          //   'activity',
          //   'admin.first_name',
          //   'admin.last_name',
          //   'admin.emai_address',
          //   'admin.phone_number',
          //   'admin.photo_url',
          //   'admin.role',
          //   'admin.type',
          // ]) // Select only the required fields
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .orderBy('order.created_at', 'DESC') // Sort by created_at in descending order
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoin('order.customer', 'customer') // Join the related vendor table
          .leftJoin('order.vendor', 'vendor') // Join the related vendor table
          .leftJoin('order.rider', 'rider') // Join the related vendor table
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .getCount(), // Count total records for pagination
      ]);

      // Return the paginated response
      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        perPage: limit,
      };
    }
  }

  async calculateParcelDeliveryCost(payload: CalculateParcelCostDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided', HttpStatus.BAD_REQUEST);
    }

    const platformFees = await this.feesRepository.find({});
    if (!platformFees || platformFees?.length == 0) {
      throw new HttpException(
        'Platform fees not initialized by admin',
        HttpStatus.FORBIDDEN,
      );
    }

    const fees = platformFees[0];
    let extraCost = 0;
    let deliveryDistance = 0;
    let deliveryTime = '';
    let riderFee = 0;

    if (
      payload?.senderLat &&
      payload?.senderLng &&
      payload?.receiverLat &&
      payload?.receiverLng
    ) {
      const mapAPIKey = process.env.GOOGLE_MAP_API_KEY ?? '';
      const origin = `${payload?.senderLat}, ${payload?.senderLng}`;
      const destination = `${payload?.receiverLat}, ${payload?.receiverLng}`;

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${mapAPIKey}`;

      const response = await axios.get(url);
      const result = response.data;

      console.log('DISTANCE CALCULATE RESULT ::: ', result);
      const serviceCharge = fees?.service_charge;

      for (let index = 0; index < result?.rows?.length; index++) {
        const element = result?.rows[index];
        console.log('DELIVERY INFO ::: ', element?.elements);
        console.log('DELIVERY DISTANCE ::: ', element?.elements[0]?.distance);
        console.log('DELIVERY DURATION ::: ', element?.elements[0]?.duration);
        deliveryTime = element?.elements[0]?.duration?.text;
        deliveryDistance = element?.elements[0]?.distance?.value;
      }

      let deliveryKM = 0;
      if (deliveryDistance === 0) {
        deliveryKM = 1 / 1000;
      } else {
        deliveryKM = deliveryDistance / 100;
      }
      console.log('DELIVERY IN KM :: ', deliveryKM);

      let deliveryFee = fees?.delivery_charge_per_km * deliveryKM;
      const weightCharge = payload?.totalWeight * fees?.delivery_charge_per_kg;
      riderFee = fees?.rider_commission_per_km * deliveryKM;
      const serviceFee = (serviceCharge / 100) * (deliveryFee + weightCharge);

      if (payload?.shippingType !== ShippingType.REGULAR) {
        if (payload?.shippingType === ShippingType.EXPRESS) {
          extraCost = deliveryFee * 10;
          deliveryFee = extraCost;
        } else {
          extraCost = deliveryFee * 20;
          deliveryFee = extraCost;
        }

        return {
          message: 'Delivery cost estimated successfully',
          delivery: result,
          service_charge: serviceFee,
          delivery_fee: deliveryFee,
          delivery_time: deliveryTime,
          rider_commission: riderFee,
          cost: extraCost + deliveryFee + weightCharge,
          total_cost: extraCost + deliveryFee + weightCharge + serviceCharge,
        };
      } else {
        return {
          delivery: result,
          service_charge: serviceFee,
          delivery_fee: deliveryFee,
          delivery_time: deliveryTime,
          rider_commission: riderFee,
          cost: extraCost + deliveryFee + weightCharge,
          message: 'Delivery cost estimated successfully',
          total_cost: extraCost + deliveryFee + weightCharge + serviceCharge,
        };
      }
    }
  }

  async calculateDeliveryCost(payload: CalculateDeliveryCostDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided', HttpStatus.BAD_REQUEST);
    }

    const platformFees = await this.feesRepository.find({});
    if (!platformFees || platformFees?.length == 0) {
      throw new HttpException(
        'Platform fees not initialized by admin',
        HttpStatus.FORBIDDEN,
      );
    }
    const fees = platformFees[0];
    // const client = new Client({});
    console.log('FEES ::: ', fees);

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });
    if (!vendor) {
      throw new HttpException('Vendor not found', HttpStatus.FORBIDDEN);
    }

    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException(
        'Vendor account not active',
        HttpStatus.FORBIDDEN,
      );
    }

    let deliveryDistance = 0;
    let deliveryTime = '';
    let riderFee = 0;

    if (payload?.latitude && payload?.longitude) {
      const mapAPIKey = process.env.GOOGLE_MAP_API_KEY ?? '';
      const origin = `${vendor?.lat}, ${vendor?.lng}`;
      const destination = `${payload?.latitude}, ${payload?.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${mapAPIKey}`;

      const response = await axios.get(url);
      const result = response.data;

      console.log('DISTANCE CALCULATE RESULT ::: ', result);
      const serviceCharge = fees?.service_charge;
      const serviceFee = (serviceCharge / 100) * payload?.totalAmount;

      for (let index = 0; index < result?.rows?.length; index++) {
        const element = result?.rows[index];
        console.log('DELIVERY INFO ::: ', element?.elements);
        console.log('DELIVERY DISTANCE ::: ', element?.elements[0]?.distance);
        console.log('DELIVERY DURATION ::: ', element?.elements[0]?.duration);
        deliveryTime = element?.elements[0]?.duration?.text;
        deliveryDistance = element?.elements[0]?.distance?.value;
      }

      const deliveryKM = deliveryDistance / 1000;
      console.log('DELIVERY IN KM :: ', deliveryKM);

      const deliveryFee = fees?.delivery_charge_per_km * deliveryKM;
      riderFee = fees?.rider_commission_per_km * deliveryKM;

      return {
        delivery: result,
        service_charge: serviceFee,
        delivery_fee: deliveryFee,
        delivery_time: deliveryTime,
        rider_commission: riderFee,
      };
    } else {
      // let extraCost = 0;
      return null;
    }

    //

    // const totalCost = weightCharge + serviceCharge + riderCharge + extraCost;

    // return {
    //   message: 'Operation successful',
    //   service_charge: serviceCharge,
    //   delivery_time: 2,
    //   // total_cost: totalCost,
    // };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    // First check if order is available
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['vendor', 'customer', 'operator', 'rider'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (status === OrderStatus.PROCESSING) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order Accepted',
          message: 'Your recent order has been accepted and is been proccessed',
          data: updatedOrder,
        },
      );
    } else if (status === OrderStatus.REJECTED) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order Declined',
          message: 'Your recent order has been declined',
          data: updatedOrder,
        },
      );
    } else if (status === OrderStatus.READY_FOR_PICKUP) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order Pickup Ready',
          message:
            'Your recent order has been processed and is ready for pickup',
          data: updatedOrder,
        },
      );

      return {
        message: 'Order status updatedd successfully',
        order: updatedOrder,
      };
    } else if (status === OrderStatus.READY_FOR_DELIVERY) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order Pickup Ready',
          message:
            'Your recent order has been processed and is ready for delivery',
          data: updatedOrder,
        },
      );

      const matchedResp = await this.matchOrderToRider(order?.id);

      this.socketGateway.sendVendorNotification(order.vendor?.id, {
        title: `Order assigned to Rider (${matchedResp.rider.first_name})`,
        message: 'You will be notified when rider accepts order',
        data: updatedOrder,
      });

      return {
        message: 'Order status updatedd successfully',
        order: updatedOrder,
      };
    } else if (status === OrderStatus.IN_DELIVERY) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      this.socketGateway.sendEvent(
        order.rider?.id,
        UserType.RIDER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order In Delivery',
          message: `A rider (${order?.rider?.first_name} ${order?.rider?.last_name}) is on the way to deliver your order`,
          data: updatedOrder,
        },
      );

      return {
        message: 'Order status updatedd successfully',
        order: updatedOrder,
      };
    } else if (status === OrderStatus.DELIVERED) {
      // Vendor operator has accepted this order
      order.order_status = status;
      order.order_delivered_at = new Date();
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      // Now notify the customer via socket here
      this.socketGateway.sendEvent(
        order.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      this.socketGateway.sendEvent(
        order.rider?.id,
        UserType.RIDER,
        'refresh-orders',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      // Now notify the customer via socket here
      this.socketGateway.sendNotification(
        order.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order In Delivery',
          message: `A rider (${order?.rider?.first_name} ${order?.rider?.last_name}) is on the way to deliver your order`,
          data: updatedOrder,
        },
      );

      this.socketGateway.sendVendorNotification(order.vendor?.id, {
        title: `Order assigned to Rider `,
        message: 'You will be notified when rider accepts order',
        data: updatedOrder,
      });

      return {
        message: 'Order status updated successfully',
        order: updatedOrder,
      };
    }
  }

  async matchOrderToRider(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['vendor'],
    });

    if (!order) throw new Error('Order not found');

    const riders = await this.riderRepository.find();

    // Fetch riders within a 10km radius
    const nearbyRiders = await this.riderRepository.find({
      where: {
        is_kyc_completed: true,
        is_email_verified: true,
        is_online: true,
        today_orders: LessThan(10), // Riders with less than 10 orders
      },
    });

    console.log('RIDERS :: ', riders);
    console.log('NEARBY RIDERS :: ', nearbyRiders);

    const ridersWithDistance = await Promise.all(
      nearbyRiders.map(async (rider) => {
        const distance = await calculateDistance(
          {
            lat: parseFloat(`${order.vendor?.lat}`),
            lng: parseFloat(`${order.vendor?.lng}`),
          },
          { lat: rider.current_lat, lng: rider.current_lng },
        );
        return { ...rider, distance };
      }),
    );

    // Sort riders by distance and daily orders
    const sortedRiders = ridersWithDistance
      .filter((rider) => rider.distance <= 55) // Drivers within 55km
      .sort(
        (a, b) => a.today_orders - b.today_orders || a.distance - b.distance,
      );

    if (sortedRiders.length === 0) {
      throw new HttpException('No riders available', HttpStatus.NOT_FOUND);
    }

    const selectedRider = await this.riderRepository.findOne({
      where: { id: sortedRiders[0]?.id },
    });

    if (!selectedRider) {
      throw new HttpException('Rider not found!!', HttpStatus.NOT_FOUND);
    }

    // Assign order to the nearest rider
    // const selectedRider = sortedRiders[0];
    order.rider = selectedRider;
    order.updated_at = new Date();
    await this.orderRepository.save(order);

    // Notify the rider
    this.socketGateway.sendNotification(selectedRider?.id, UserType.RIDER, {
      message: `New order assigned: ${order.id}`,
    });

    return { message: 'Order successfully assigned', rider: selectedRider };
  }

  // Runs every minute to check orders
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndCompleteOrders() {
    this.logger.log('Checking for orders to auto-complete...');

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

    const ordersToUpdate = await this.orderRepository.find({
      where: {
        order_status: OrderStatus.DELIVERED, // Only check delivered orders
        order_delivered_at: LessThanOrEqual(tenMinutesAgo),
      },
    });

    // const platformFees = await this.feesRepository.find({});
    // if (!platformFees || platformFees?.length == 0) {
    //   return;
    //   // throw new HttpException(
    //   //   'Platform fees not initialized by admin',
    //   //   HttpStatus.FORBIDDEN,
    //   // );
    // }
    // // const fees = platformFees[0];

    if (ordersToUpdate.length > 0) {
      for (const order of ordersToUpdate) {
        order.order_status = OrderStatus.COMPLETED;
        await this.orderRepository.save(order);

        if (order?.order_type !== OrderType.PARCEL_ORDER) {
          const rider = await this.riderRepository.findOne({
            where: { id: order?.rider?.id },
          });

          if (rider) {
            // Fundd this ridder's wallet
            const riderWallet = await this.riderWalletRepository.findOne({
              where: { rider: { id: rider?.id } },
              relations: ['rider'],
            });

            if (!riderWallet) {
              return;
            }

            riderWallet.prev_balance = riderWallet.balance;
            riderWallet.balance = riderWallet.balance + order?.rider_commission;
            await this.riderWalletRepository.save(riderWallet);
            // Now create transactions here for fastbuy, vendor and rider
            // Distribute profits
            const riderTransaction = this.riderTransactionRepository.create({
              amount: order?.rider_commission,
              fee: 0,
              status: 'success',
              summary: 'Payment for order delivery',
              transaction_type: TransactionType.CREDIT,
              tx_ref: order?.order_id,
              created_at: new Date(),
              updated_at: new Date(),
            });

            riderTransaction.rider = rider;
            const updated =
              await this.riderTransactionRepository.save(riderTransaction);

            this.socketGateway.sendEvent(
              rider?.id,
              UserType.RIDER,
              'refresh-wallet',
              { message: 'Refresh wallet now', data: updated },
            );

            return {
              message: 'Transaction completed successfully',
            };
          }

          const vendor = await this.vendorRepository.findOne({
            where: { id: order?.rider?.id },
          });

          if (vendor && vendor?.status === VendorStatus.ACTIVE) {
            const vendorWallet = await this.vendorWalletRepository.findOne({
              where: { vendor: { id: vendor?.id } },
              relations: ['vendor'],
            });

            if (!vendorWallet) {
              return;
            }

            const couponDiscount = order.coupon_discount;
            const amt = order.total_amount - couponDiscount;

            vendorWallet.prev_balance = vendorWallet.balance;
            vendorWallet.balance = vendorWallet.balance + amt;
            await this.vendorWalletRepository.save(vendorWallet);

            // Now create transactions here for fastbuy, vendor and rider
            // Distribute profits
            const vendorTransaction = this.vendorTransactionRepository.create({
              amount: amt,
              fee: 0,
              status: 'success',
              summary: 'Payment for order purchase',
              transaction_type: TransactionType.CREDIT,
              tx_ref: order?.order_id,
              created_at: new Date(),
              updated_at: new Date(),
            });

            vendorTransaction.vendor = vendor;
            const updated =
              await this.vendorTransactionRepository.save(vendorTransaction);

            this.socketGateway.sendEvent(
              rider?.id,
              UserType.RIDER,
              'refresh-wallet',
              { message: 'Refresh wallet now', data: updated },
            );

            return {
              message: 'Transaction completed successfully',
            };
          }

          const remDeliveryFee = order.delivery_fee - order?.rider_commission;
          const amt = order.service_charge + remDeliveryFee;
          const systemTransaction = this.systemTransactionRepository.create({
            amount: amt,
            fee: 0,
            status: 'success',
            summary: 'Payment for order purchase',
            transaction_type: TransactionType.CREDIT,
            tx_ref: order?.order_id,
            created_at: new Date(),
            updated_at: new Date(),
          });

          systemTransaction.order = order;
          const updated =
            await this.systemTransactionRepository.save(systemTransaction);
          console.log('UPDATED SYSTEM NOTIF ::: ', updated);

          // this.socketGateway.sendEvent(
          //   rider?.id,
          //   UserType.RIDER,
          //   'refresh-wallet',
          //   { message: 'Refresh wallet now', data: updated },
          // );

          return {
            message: 'Transaction completed successfully',
          };
        } else if (order?.order_type === OrderType.PARCEL_ORDER) {
          const rider = await this.riderRepository.findOne({
            where: { id: order?.rider?.id },
          });

          if (rider) {
            const riderWallet = await this.riderWalletRepository.findOne({
              where: { rider: { id: rider?.id } },
              relations: ['rider'],
            });

            if (!riderWallet) {
              return;
            }

            riderWallet.prev_balance = riderWallet.balance;
            riderWallet.balance = riderWallet.balance + order?.rider_commission;
            await this.riderWalletRepository.save(riderWallet);
            // Now create transactions here for fastbuy, vendor and rider
            // Distribute profits
            const riderTransaction = this.riderTransactionRepository.create({
              amount: order?.rider_commission,
              fee: 0,
              status: 'success',
              summary: 'Payment for order delivery',
              transaction_type: TransactionType.CREDIT,
              tx_ref: order?.order_id,
              created_at: new Date(),
              updated_at: new Date(),
            });

            riderTransaction.rider = rider;
            const updated =
              await this.riderTransactionRepository.save(riderTransaction);

            this.socketGateway.sendEvent(
              rider?.id,
              UserType.RIDER,
              'refresh-wallet',
              { message: 'Refresh wallet now', data: updated },
            );

            return {
              message: 'Transaction completed successfully',
            };
          }

          const remDeliveryFee = order.delivery_fee - order?.rider_commission;
          const amt = order.service_charge + remDeliveryFee;
          const systemTransaction = this.systemTransactionRepository.create({
            amount: amt,
            fee: 0,
            status: 'success',
            summary: 'Payment for order purchase',
            transaction_type: TransactionType.CREDIT,
            tx_ref: order?.order_id,
            created_at: new Date(),
            updated_at: new Date(),
          });

          systemTransaction.order = order;
          const updated =
            await this.systemTransactionRepository.save(systemTransaction);
          console.log('UPDATED SYSTEM NOTIF ::: ', updated);

          // this.socketGateway.sendEvent(
          //   rider?.id,
          //   UserType.RIDER,
          //   'refresh-wallet',
          //   { message: 'Refresh wallet now', data: updated },
          // );

          return {
            message: 'Transaction completed successfully',
          };
        }
      }
    } else {
      this.logger.log('No orders to update.');
    }
  }
}
