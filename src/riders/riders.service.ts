import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { encodePassword } from 'src/utils/bcrypt';
import { Repository } from 'typeorm';
import { CreateRiderDTO } from './dtos/createrider.dto';
import { Rider } from 'src/entities/rider.entity';
import generateRandomPassword from 'src/utils/password_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnboardingEmailContent } from 'src/utils/email';
import { UserType } from 'src/enums/user.type.enum';
import { ZonesService } from 'src/zones/zones.service';
import { Admin } from 'src/entities/admin.entity';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { RiderWallet } from 'src/entities/rider.wallet.entity';
import { UserStatus } from 'src/enums/user.status.enum';
import { RiderTransactions } from 'src/entities/rider.transactions.entity';
import { TopupWalletDTO } from './dtos/topupwallet.dto';
import { RiderDocument } from 'src/entities/rider.document.entity';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { RiderReview } from 'src/entities/rider.review.entity';
import { ReviewRiderDTO } from './dtos/review.rider.dto';
import { Customer } from 'src/entities/customer.entity';
import { Operator } from 'src/entities/operator.entity';
import { Vendor } from 'src/entities/vendor.entity';
import * as bcrypt from 'bcrypt';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';
import {
  RiderArrivedCustomerDTO,
  RiderArrivedVendorDTO,
} from './dtos/rider.arrived.dto';
import { Order } from 'src/entities/order.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import {
  AcceptOrderDTO,
  CustomerUnavailableDTO,
  RejectOrderDTO,
} from './dtos/order.action.dto';
import { OrderType } from 'src/enums/order.type.enum';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { TransactionType } from 'src/enums/transaction.type.enum';
import generateRandomCoupon from 'src/utils/coupon_generator';
import { OrdersService } from 'src/orders/orders.service';
import { OrderStatus } from 'src/enums/order.status.enum';
import { Complaint } from 'src/entities/complaint.entity';
import { LogComplaintDTO } from './dtos/log.complaint.dto';
import { ReporteeType } from 'src/enums/reportee.type.enum';
import { CompleteRiderKYCDTO } from './dtos/rider.kyc.dto';
import { SmsService } from 'src/sms/sms.service';
import { SMSProviders } from 'src/entities/sms.provider.entity';

@Injectable()
export class RidersService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Operator)
    private readonly OperatorRepository: Repository<Operator>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(RiderWallet)
    private readonly walletRepository: Repository<RiderWallet>,
    @InjectRepository(RiderTransactions)
    private readonly transactionRepository: Repository<RiderTransactions>,
    @InjectRepository(RiderDocument)
    private readonly documentRepository: Repository<RiderDocument>,
    @InjectRepository(AdminActivity)
    private readonly activitiesRepository: Repository<AdminActivity>,
    @InjectRepository(RiderReview)
    private readonly reviewRepository: Repository<RiderReview>,
    @InjectRepository(CommissionAndFee)
    private commissionAndFeeRepository: Repository<CommissionAndFee>,
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    private zoneService: ZonesService,
    private mailerService: MailerService,
    private socketGateway: SocketGateway,
    private orderService: OrdersService,
    private smsService: SmsService,
    @InjectRepository(SMSProviders)
    private readonly smsRepository: Repository<SMSProviders>,
  ) {}

  findRiders() {
    return this.riderRepository.find();
  }

  async findRidersPaged(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.riderRepository
        .createQueryBuilder('rider') // Alias for the Admin table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.riderRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createRider(email_address: string, createRiderDto: CreateRiderDTO) {
    const adm = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });
    if (!adm) {
      throw new HttpException(
        {
          message: 'Admin not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.SUPER_ADMIN &&
      adm.role !== AdminRoles.DEVELOPER &&
      adm.access !== AdminAccess.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // First check if rider already exist
    const riderFound = await this.riderRepository.findOne({
      where: { email_address: createRiderDto?.email_address },
    });
    if (riderFound) {
      throw new HttpException(
        {
          message: 'Email address already taken!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // First check if zone exist
    const riderPhone = await this.riderRepository.findOne({
      where: { phone_number: createRiderDto?.phone_number },
    });
    if (riderPhone) {
      throw new HttpException(
        {
          message: 'Phone number already taken!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // First check if zone exist
    const zone = await this.zoneService.findZoneById(createRiderDto.zoneId);
    if (!zone) {
      throw new HttpException(
        {
          message: 'Zone not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const generatedPassword = generateRandomPassword();
    const encodedPassword = await encodePassword(generatedPassword);
    const newUser = this.riderRepository.create({
      country_code: createRiderDto.country_code,
      password: encodedPassword,
      city: createRiderDto.city,
      country: createRiderDto.country,
      email_address: createRiderDto.email_address,
      first_name: createRiderDto.first_name,
      last_name: createRiderDto.last_name,
      intl_phone_format: createRiderDto.intl_phone_format,
      iso_code: createRiderDto.iso_code,
      phone_number: createRiderDto.phone_number,
      state: createRiderDto.state,
      street: createRiderDto.street,
      identity_type: createRiderDto.identity_type,
      identity_number: createRiderDto.identity_number,
      id_front_view: createRiderDto.front_view,
      id_back_view: createRiderDto.back_view,
      created_at: new Date(),
      updated_at: new Date(),
    });

    newUser.zone = zone;
    await this.riderRepository.save(newUser);

    //Now save rider documents here
    const doc = this.documentRepository.create({
      name: `${newUser?.first_name} ${newUser?.last_name}\'s ${newUser?.identity_type}`,
      front_view: createRiderDto?.front_view,
      back_view: createRiderDto?.back_view,
      created_at: new Date(),
      updated_at: new Date(),
    });
    doc.owner = newUser;
    await this.documentRepository.save(doc);

    // Now create wallet as well
    const wallet = this.walletRepository.create({
      balance: 0.0,
      prev_balance: 0.0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    wallet.rider = newUser;
    await this.walletRepository.save(wallet);

    // Now send this passwordd to rider's email address
    await this.mailerService.sendMail({
      to: createRiderDto?.email_address,
      subject: 'New Rider Onboarding',
      html: userOnboardingEmailContent(
        {
          email_address: createRiderDto.email_address,
          type: UserType.RIDER,
          password: generatedPassword,
          phone: createRiderDto?.phone_number,
        },
        `${createRiderDto?.first_name} ${createRiderDto?.last_name}`,
      ),
    });

    const { password, ...rest } = newUser;
    console.log('PAss', password);

    return {
      message: 'Rider onboarded successfully',
      data: rest,
    };
  }

  async findUserByUsername(email_address: string): Promise<Rider> {
    const foundUser = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }

  async findCurrentRider(email_address: string) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      return null;
    }

    const { password, ...rest } = rider;
    console.log(password);

    return rest;
  }

  async findRiderByPhone(phone_number: string): Promise<Rider> {
    const foundUser = await this.riderRepository.findOne({
      where: { phone_number: phone_number },
    });

    if (!foundUser) {
      // throw new HttpException(
      //   'User with phone number not found!',
      //   HttpStatus.NOT_FOUND,
      // );
      return null;
    }

    // console.log('FOUND USER :: ', foundUser);

    return foundUser;
  }

  findUserById(id: string) {
    return this.riderRepository.findOne({ where: { id: id } });
  }

  async updateUser(email: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    try {
      if (!payload) {
        throw new HttpException(
          'Payload not provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.riderRepository.findOne({
        where: { email_address: email },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      await this.riderRepository.update({ id: user?.id }, { ...payload });
      const updatedUser = await this.riderRepository.findOne({
        where: { id: user?.id },
      });

      const { password, ...others } = updatedUser;
      console.log('REMOVED PASWORD ::: ', password);

      global.io?.emit('profile-updated', {
        message: 'You updated your profile',
        user: others,
      });

      // this.socketGateway.emitEvent('profile-updated', others);

      return {
        message: 'Profile updated successfully',
        user: others,
      };
    } catch (error) {
      console.log('PROFILE UPDATE ERROR ::: ', error);
      return {
        message: error?.response?.data?.message || 'An error occurred!',
      };
    }
  }

  async completeKYC(email_address: string, payload: CompleteRiderKYCDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    const zone = await this.zoneService.findZoneById(payload?.zoneId);

    if (!zone) {
      throw new HttpException('Zone not found', HttpStatus.NOT_FOUND);
    }

    // Now complete KYC
    rider.current_lat = payload.latitude;
    rider.current_lng = payload?.longitude;
    rider.first_name = payload?.first_name;
    rider.last_name = payload?.last_name;
    rider.photo_url = payload?.photo_url;
    rider.is_email_verified = true;
    rider.is_kyc_completed = true;
    rider.kyc_completed_at = new Date();
    rider.zone = zone;
    rider.updated_at = new Date();

    const updatedRider = await this.riderRepository.save(rider);

    return {
      message: 'KYC completed successfully',
      user: updatedRider,
    };
  }

  async suspendRider(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        where: { email_address: email_address },
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.role !== AdminRoles.SUPER_ADMIN &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.access !== AdminAccess.READ_WRITE
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundRider = await this.riderRepository.findOne({
        where: { id: id },
      });
      if (!foundRider) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.riderRepository.update(
        { id: foundRider?.id }, // Update condition
        { status: UserStatus.SUSPENDED }, // New values to set
      );

      const activity = this.activitiesRepository.create({
        name: 'Rider Account Suspension',
        description: `${adm?.first_name} ${adm?.last_name} suspended the rider account (${foundRider?.first_name} ${foundRider?.last_name})`,
        created_at: new Date(),
        updated_at: new Date(),
      });
      activity.user = adm;
      this.activitiesRepository.save(activity);

      return {
        message: 'Rider account suspended successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async pardonRider(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        where: { email_address: email_address },
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.role !== AdminRoles.SUPER_ADMIN &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.access !== AdminAccess.READ_WRITE
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundRider = await this.riderRepository.findOne({
        where: { id: id },
      });
      if (!foundRider) {
        throw new HttpException(
          'Rider record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.riderRepository.update(
        { id: id },
        { status: UserStatus.ACTIVE, updated_at: new Date() },
      );

      const activity = this.activitiesRepository.create({
        name: 'Rider Account Pardoned',
        created_at: new Date(),
        updated_at: new Date(),
        description: `${adm?.first_name} ${adm?.last_name} pardoned the rider account (${foundRider?.first_name} ${foundRider?.last_name})`,
      });

      activity.user = adm;
      await this.activitiesRepository.save(activity);

      return {
        message: 'Rider account pardoned successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteRider(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        where: { email_address: email_address },
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.role !== AdminRoles.SUPER_ADMIN &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.access !== AdminAccess.READ_WRITE
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundAdmin = await this.adminRepository.findOne({
        where: { id: id },
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      const activity = this.activitiesRepository.create({
        name: 'Account Account deleted',
        description: `${adm?.first_name} ${adm?.last_name} deleted the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        user: adm,
      });

      await this.activitiesRepository.save(activity);

      await this.adminRepository.delete({ id: id });

      return {
        message: 'Admin account deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async topupWallet(walletID: string, { amount, riderId }: TopupWalletDTO) {
    const rider = await this.riderRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new HttpException(
        {
          message: 'Rider not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const wallet = await this.walletRepository.findOne({
      where: { id: walletID },
    });

    if (!wallet) {
      throw new HttpException(
        {
          message: 'Vendor wallet not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (rider.status !== UserStatus.ACTIVE) {
      throw new HttpException(
        {
          message: 'Rider account not active!',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now update rider wallet here
    const balance = wallet.balance;
    wallet.prev_balance = balance;
    wallet.balance = balance + amount;
    wallet.updated_at = new Date();
    const walletUpdate = await this.walletRepository.save(wallet);

    // Now create transaction here

    return {
      message: 'Wallet topup successful',
      data: walletUpdate,
    };
  }

  async findAllWallets(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.walletRepository
        .createQueryBuilder('wallet') // Alias for the Admin table
        .leftJoinAndSelect('wallet.rider', 'rider') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.walletRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findRiderWallet(riderID: string) {
    const rider = await this.riderRepository.findOne({
      where: { id: riderID },
    });

    if (!rider || rider.status === UserStatus.DELETED) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Rider account not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Retrieve the wallet belonging to the rider
    const wallet = await this.walletRepository.findOne({
      where: { rider: { id: riderID } }, // Ensure nested object is handled correctly
      relations: ['rider'], // Include rider relationship if needed
    });

    if (!wallet) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Wallet not found for this rider',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return wallet;
  }

  async riderOrders(page: number, limit: number, riderId: string) {
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
      this.orderRepository
        .createQueryBuilder('orders') // Alias for the table
        .leftJoinAndSelect('orders.customer', 'customer') // Join the related product table
        .leftJoinAndSelect('orders.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('orders.rider', 'rider') // Join the related product table
        .leftJoinAndSelect('vendor.categories', 'categories')
        .leftJoinAndSelect('vendor.owner', 'owner')
        .where('rider.id = :riderId', { riderId }) // Filter by vendor ID
        .orderBy('orders.created_at', 'DESC') // Sort by created_at in descending order
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.orderRepository
        .createQueryBuilder('orders') // Alias for the table
        .leftJoin('orders.customer', 'customer') // Join the related vendor table
        .leftJoinAndSelect('orders.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('orders.rider', 'rider') // Join the related product table
        .innerJoinAndSelect('vendor.categories', 'categories')
        .where('rider.id = :riderId', { riderId }) // Filter by vendor ID
        .getCount(), // Count total records for pagination
    ]);

    console.log('ITEMS :::: ===>>> ', total);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async riderActiveOrders(page: number, limit: number, riderId: string) {
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

    const skip = (page - 1) * limit; // Calculate records to skip
    const excludedStatuses = [
      OrderStatus.CANCELLED,
      OrderStatus.COMPLETED,
      OrderStatus.REJECTED,
      OrderStatus.DELIVERED,
      OrderStatus.READY_FOR_PICKUP,
    ]; // Exclude these statuses

    const [data, total] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('orders') // Alias for the table
        .leftJoinAndSelect('orders.customer', 'customer')
        .leftJoinAndSelect('orders.vendor', 'vendor')
        .leftJoinAndSelect('orders.rider', 'rider')
        .leftJoinAndSelect('vendor.categories', 'categories')
        .leftJoinAndSelect('vendor.owner', 'owner')
        .where('rider.id = :riderId', { riderId }) // Filter by rider ID
        .andWhere('orders.order_status NOT IN (:...excludedStatuses)', {
          excludedStatuses,
        }) // Exclude statuses
        .orderBy('orders.created_at', 'DESC') // Sort by latest
        .skip(skip) // Pagination
        .take(limit) // Limit records
        .getMany(), // Execute query

      this.orderRepository
        .createQueryBuilder('orders')
        .leftJoin('orders.customer', 'customer')
        .leftJoinAndSelect('orders.vendor', 'vendor')
        .leftJoinAndSelect('orders.rider', 'rider')
        .innerJoinAndSelect('vendor.categories', 'categories')
        .where('rider.id = :riderId', { riderId }) // Filter by rider ID
        .andWhere('orders.order_status NOT IN (:...excludedStatuses)', {
          excludedStatuses,
        }) // Exclude statuses
        .getCount(), // Count total records
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findAllTransactions(
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Create the base query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.rider', 'rider');

    // Apply date filter if both startDate and endDate are provided
    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const [data, total] = await Promise.all([
      queryBuilder
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.transactionRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findRiderTransactions(
    page: number,
    limit: number,
    riderID: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const rider = await this.riderRepository.findOne({
      where: { id: riderID },
    });

    if (!rider || rider.status === UserStatus.DELETED) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Rider account not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Create the base query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.rider', 'rider')
      .where('rider.id = :riderID', { riderID })
      .orderBy('transaction.created_at', 'DESC');

    // Apply date filter if both startDate and endDate are provided
    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const [data, total] = await Promise.all([
      queryBuilder
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.transactionRepository
        .createQueryBuilder('transaction') // Alias for the table
        .leftJoin('transaction.rider', 'rider') // Join the related vendor table
        .where('rider.id = :riderID', { riderID }) // Filter by vendor ID
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

  async findAllDocuments(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.documentRepository
        .createQueryBuilder('documentRepo') // Alias for the Admin table
        .leftJoinAndSelect('documentRepo.owner', 'owner') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.documentRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async reviewRider(riderId: string, payload: ReviewRiderDTO) {
    /// First find rider
    const rider = await this.riderRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new HttpException(
        {
          message: 'Ridedr not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // First ascertain the reviewer type
    if (payload.user_type === UserType.CUSTOMER) {
      // Now check if this customer already has a review for this rider
      const matchedReview = await this.reviewRepository.findOne({
        where: {
          customer: { id: payload.reviewer_id },
        },
      });

      if (matchedReview) {
        throw new HttpException(
          {
            message: 'You already have a reviewed',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Now get this customer info
      const customer = await this.customerRepository.findOne({
        where: {
          id: payload.reviewer_id,
        },
      });

      // Now review this rider
      const newReview = this.reviewRepository.create({
        message: payload?.message,
        rating: payload?.rating,
        created_at: new Date(),
        updated_at: new Date(),
      });

      newReview.customer = customer;
      newReview.rider = rider;

      const result = await this.reviewRepository.save(newReview);
      return {
        message: 'Rider successfully reviewed',
        data: result,
      };
    } else if (payload.user_type === UserType.OPERATOR) {
      // Now check if this customer already has a review for this rider
      const matchedReview = await this.reviewRepository.findOne({
        where: {
          vendor: { id: payload.reviewer_id },
        },
      });

      if (matchedReview) {
        throw new HttpException(
          {
            message: 'You already have a reviewed',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Now get this customer info
      const vendor = await this.vendorRepository.findOne({
        where: {
          id: payload?.reviewer_id,
        },
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

      // Now review this rider
      const newReview = this.reviewRepository.create({
        message: payload?.message,
        rating: payload?.rating,
        created_at: new Date(),
        updated_at: new Date(),
      });

      newReview.vendor = vendor;
      newReview.rider = rider;

      const result = await this.reviewRepository.save(newReview);
      return {
        message: 'Rider successfully reviewed',
        data: result,
      };
    }
  }

  async setWalletPin(email_address: string, payload: UpdateWalletPINDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    // Now find wallett
    const wallet = await this.walletRepository.findOne({
      where: { rider: { id: rider?.id } },
    });

    if (!wallet) {
      throw new HttpException('Rider wallet not found', HttpStatus.NOT_FOUND);
    }

    if (rider?.wallet_pin) {
      // It has been addded before, so compare with new pin before updting
      if (!payload?.old_pin) {
        throw new HttpException(
          'Old wallet pin is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const savedPin = rider?.wallet_pin;
      if (rider && !bcrypt.compareSync(payload?.old_pin, savedPin)) {
        throw new HttpException(
          'Incorrect wallet pin entered',
          HttpStatus.BAD_REQUEST,
        );
      } else if (rider && bcrypt.compareSync(payload?.old_pin, savedPin)) {
        // All good
        // Noow encodde new pin
        const encodedPassword = await encodePassword(payload.new_pin);
        rider.wallet_pin = encodedPassword;
        rider.updated_at = new Date();

        await this.riderRepository.save(rider);
        return {
          message: 'Wallet pin updated successfully',
        };
      }
    } else {
      // Create new pin
      const encodedPassword = await encodePassword(payload.new_pin);
      rider.wallet_pin = encodedPassword;
      rider.updated_at = new Date();

      await this.riderRepository.save(rider);
      const refreshed = await this.riderRepository.findOne({
        where: { id: rider?.id },
      });
      return {
        message: 'Wallet pin set successfully',
        data: refreshed,
      };
    }
  }

  async setHasArrivedVendor(
    email_address: string,
    payload: RiderArrivedVendorDTO,
  ) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vendor) {
      throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    // Now updadte the order status
    order.order_status = OrderStatus.RIDER_ARRIVED_VENDOR;
    order.updated_at = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // Now Notify this vendor that the rider has arrivedd to pickup this order
    this.socketGateway.sendVendorNotification(vendor?.id, {
      order: order,
      message: 'Dispatch rider has arrived',
    });

    // Also send a notification to this vendor's phone

    return {
      message: 'Arrival status updated successfully',
      order: updatedOrder,
    };
  }

  async setHasArrivedCustomer(
    email_address: string,
    payload: RiderArrivedCustomerDTO,
  ) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    const customer = await this.customerRepository.findOne({
      where: { id: payload?.customerId },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    order.order_status = OrderStatus.RIDER_ARRIVED_CUSTOMER;
    order.updated_at = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // Now Notify this vendor that the rider has arrivedd to pickup this order
    this.socketGateway.sendNotification(customer?.id, UserType.CUSTOMER, {
      order: updatedOrder,
      title: 'Rider Has Arrived',
      message: 'Go get your order! Do not keep the dispatch rider waiting',
    });

    this.socketGateway.sendEvent(
      customer?.id,
      UserType.CUSTOMER,
      'refresh-orders',
      {
        message: 'Order Refreshing...',
      },
    );

    this.socketGateway.sendEvent(rider?.id, UserType.RIDER, 'refresh-orders', {
      message: 'Order Refreshing...',
    });

    // Also send a notification to this customer's phone
    const defaultSMSProvider = await this.smsRepository.findOne({
      where: { is_default: true },
    });
    if (!defaultSMSProvider) {
      return;
    }

    try {
      await this.smsService.sendOTP({
        providerEntity: defaultSMSProvider,
        message: `Rider has arrived. Use the code ${order?.access_code}`,
        phoneNumber: customer?.intl_phone_format,
      });
    } catch (error) {
      console.log(error);
      // throw new HttpException(
      //   `Error occurred sending otp ${error}`,
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
    }

    return {
      message: 'Customer notified of your arrival',
      order: updatedOrder,
    };
  }

  async acceptOrder(email_address: string, payload: AcceptOrderDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    if (!rider.is_email_verified || !rider.is_kyc_completed) {
      throw new HttpException(
        'You must complete your KYC to accept orders',
        HttpStatus.FORBIDDEN,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
      relations: ['vendor'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.order_type === OrderType.PARCEL_ORDER) {
      // Notify FastBuy instead
    } else {
      order.order_status = OrderStatus.RIDER_ACCEPTED;
      order.updated_at = new Date();

      const updatedorder = await this.orderRepository.save(order);

      this.socketGateway.sendEvent(rider.id, UserType.RIDER, 'refresh-orders', {
        message: 'order acceptedby you',
      });
      // Notify the vendor that rider is on his way
      this.socketGateway.sendVendorNotification(order?.vendor?.id, {
        message: 'Ensure order is ready. Do not keep rider waiting',
        title: 'Rider On The Way',
        rider: rider,
      });

      // Now send access code to rider
      if (rider.intl_phone_format) {
        const defaultSMSProvider = await this.smsRepository.findOne({
          where: { is_default: true },
        });
        if (!defaultSMSProvider) {
          throw new HttpException(
            'No default SMS provider found',
            HttpStatus.NOT_FOUND,
          );
        }

        try {
          await this.smsService.sendOTP({
            providerEntity: defaultSMSProvider,
            message: `Use the access code below to access order from vendor. ${order.access_code}`,
            phoneNumber: rider?.intl_phone_format,
          });
        } catch (error) {
          console.log(error);
          throw new HttpException(
            `Error occurred sending otp ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return {
          message: 'Order accepted successfully',
          order: updatedorder,
        };
      }

      // Also send to email
      await this.mailerService.sendMail({
        to: email_address,
        subject: 'Account Password Reset OTP',
        html: `<div>
        <br/>
        <h5>Hi ${rider.first_name} ${rider.last_name}</h5>
        <br/>
        <p>Use the access code below. Keep it confidential. You will be required to present it to vendor upon your arrival. </p>
        <strong>${order.access_code}</strong>
        </div>`,
      });
    }
  }

  async rejectOrder(email_address: string, payload: RejectOrderDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    if (!rider.is_email_verified || !rider.is_kyc_completed) {
      throw new HttpException(
        'You must complete your KYC to reject orders',
        HttpStatus.FORBIDDEN,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const existingFee = await this.commissionAndFeeRepository.find({});

    if (existingFee?.length > 0) {
      throw new HttpException(
        'Fees not setup. Contact support',
        HttpStatus.FORBIDDEN,
      );
    }

    const wallet = await this.walletRepository.findOne({
      where: { rider: { id: rider?.id } },
    });

    if (!wallet) {
      throw new HttpException('Rider wallet not found', HttpStatus.NOT_FOUND);
    }

    if (wallet.balance < existingFee[0]?.rider_order_cancellation) {
      throw new HttpException(
        'Insufficient wallet balance to cancel order',
        HttpStatus.FORBIDDEN,
      );
    }

    wallet.prev_balance = wallet.balance;
    wallet.balance = wallet.balance - existingFee[0]?.rider_order_cancellation;

    await this.walletRepository.save(wallet);

    // Now create a transaction to this effect here
    const trans = await this.transactionRepository.create({
      amount: existingFee[0]?.rider_order_cancellation,
      fee: 0,
      transaction_type: TransactionType.WITHDRAWAL,
      summary: 'Order cancellation fee',
      tx_ref: `CNL-${order?.order_id}-${generateRandomCoupon(4, rider?.first_name)}`,
      status: 'success',
      created_at: new Date(),
      updated_at: new Date(),
    });

    trans.rider = rider;
    await this.transactionRepository.save(trans);

    // Now reassign this order to the next available rider
    await this.orderService.matchOrderToRider(order?.id);

    return {
      message: 'Order rejected successfully',
    };
  }

  async customerUnvailable(
    email_address: string,
    payload: CustomerUnavailableDTO,
  ) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    const customer = await this.customerRepository.findOne({
      where: { id: payload?.customerId },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
      relations: ['vendor'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    // Mark order as completed and return item back to vendor
    // And refund customer via order means of payment
    order.order_status = OrderStatus.CANCELLED;
    // Notify vendor of imminent order return
    this.socketGateway.sendVendorNotification(order?.vendor?.id, {
      title: 'Order Cancelled',
      message:
        'The customer was not available to pick the order. Rider will return the order soon',
      rider: rider,
    });
  }

  async reportCustomer(email_address: string, payload: LogComplaintDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    // Now create a complaint
    const newComplain = await this.complaintRepository.create({
      first_name: payload?.firstname,
      last_name: payload?.lastname,
      message: payload?.message,
      subject: payload?.subject,
      reportee_id: payload?.reporteeId,
      reportee_type: ReporteeType.CUSTOMER,
      reporter_id: rider?.id,
      reporter_type: UserType?.RIDER,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedComplain = await this.complaintRepository.save(newComplain);
    return {
      message: 'Complain submitted successfully',
      data: savedComplain,
    };
  }

  async reportVendor(email_address: string, payload: LogComplaintDTO) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    // Now create a complaint
    const newComplain = await this.complaintRepository.create({
      first_name: payload?.firstname,
      last_name: payload?.lastname,
      message: payload?.message,
      subject: payload?.subject,
      reportee_id: payload?.reporteeId,
      reportee_type: ReporteeType.VENDOR,
      reporter_id: rider?.id,
      reporter_type: UserType?.RIDER,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedComplain = await this.complaintRepository.save(newComplain);
    return {
      message: 'Complain submitted successfully',
      data: savedComplain,
    };
  }

  async setAvailability(email_address: string, isAvailable: boolean) {
    const rider = await this.riderRepository.findOne({
      where: { email_address: email_address },
    });

    if (!rider) {
      throw new HttpException('Rider not found', HttpStatus.NOT_FOUND);
    }

    rider.is_online = Boolean(isAvailable);
    rider.updated_at = new Date();

    const updatedRider = await this.riderRepository.save(rider);
    console.log('UpDATED RIDDER HERE ::: ', updatedRider);

    return {
      message: 'Availability updated succesfully',
      data: updatedRider,
    };
  }
}
