import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Operator } from 'src/entities/operator.entity';
import { Order } from 'src/entities/order.entity';
import { UserType } from 'src/enums/user.type.enum';
import { Repository } from 'typeorm';
import { CreateOrderDTO } from './dtos/createorder.dto';
import { Vendor } from 'src/entities/vendor.entity';
import { UpdateOrderDTO } from './dtos/updateorder.dto';
import { Rider } from 'src/entities/rider.entity';
import { OrderType } from 'src/enums/order.type.enum';
import { OrderStatus } from 'src/enums/order.status.enum';

@Injectable()
export class OrdersService {
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
  ) {}

  async createOrder(
    email_address: string,
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
      // Create customer ordder here
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

      const newOrder = this.orderRepository.create({
        amount: payload?.amount,
        items: payload?.items,
        order_type: payload?.order_type,
        created_at: new Date(),
        updated_at: new Date(),
      });

      newOrder.customer = customer;

      const savedOrder = await this.orderRepository.save(newOrder);

      // Now get the order uuid and truncate for orderNo
      const orderId = savedOrder.id;
      const truncateId = orderId.substring(0, 10);

      savedOrder.order_id = truncateId;
      const updatedOrder = await this.orderRepository.save(savedOrder);

      return {
        message: 'New order created successfully',
        data: updatedOrder,
      };
    } else if (user_type === 'operator') {
      if (!payload?.operatorId) {
        throw new HttpException(
          {
            message: 'Operator ID is required',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // Create customer ordder here
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

      const newOrder = this.orderRepository.create({
        amount: payload?.amount,
        items: payload?.items,
        order_type: payload?.order_type,
        created_at: new Date(),
        updated_at: new Date(),
      });

      newOrder.operator = operator;

      const savedOrder = await this.orderRepository.save(newOrder);

      // Now get the order uuid and truncate for orderNo
      const orderId = savedOrder.id;
      const truncateId = orderId.substring(0, 10);

      savedOrder.order_id = truncateId;
      const updatedOrder = await this.orderRepository.save(savedOrder);

      return {
        message: 'New order created successfully',
        data: updatedOrder,
      };
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

  async all(page: number, limit: number, type: OrderType) {
    if (type) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.orderRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoinAndSelect('order.vendor', 'vendor') // Join the related product table
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
          .where('order.order_type = :type', { type }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.vendorRepository
          .createQueryBuilder('order') // Alias for the table
          .leftJoin('order.vendor', 'vendor') // Join the related vendor table
          .where('order.order_type = :type', { type }) // Filter by vendor ID
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
        .where('order.order_status = :status', { status }) // Filter by vendor ID
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

  async vendorOrders(vendorId: string, page: number, limit: number) {
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

  async customerOrders(customerId: string, page: number, limit: number) {
    // First find this vendor first
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new HttpException(
        {
          message: 'Customer record not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

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
        .where('customer.id = :customerId', { customerId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.orderRepository
        .createQueryBuilder('order') // Alias for the table
        .leftJoin('order.customer', 'customer') // Join the related vendor table
        .leftJoin('order.vendor', 'vendor') // Join the related vendor table
        .leftJoin('order.rider', 'rider') // Join the related vendor table
        .where('customer.id = :customerId', { customerId }) // Filter by vendor ID
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
