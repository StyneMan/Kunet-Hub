import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from 'src/entities/vendor.entity';
import { Repository } from 'typeorm';
import { CreateVendorDTO } from './dtos/createvendor.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { encodePassword } from 'src/utils/bcrypt';
import { Admin } from 'src/entities/admin.entity';
import { Operator } from 'src/entities/operator.entity';
import { OperatorRole, OperatorType } from 'src/enums/operator.type.enum';
import { userOnboardingEmailContent } from 'src/utils/email';
import { AddCategoryDTO } from './dtos/addcategory.dto';
import { Category } from 'src/entities/category.entity';
import { ZonesService } from 'src/zones/zones.service';
import { OperatorDocument } from 'src/entities/operator.document.entity';
import { UserType } from 'src/enums/user.type.enum';
import { VendorType } from 'src/enums/vendor.type.enum';
import { plainToClass } from 'class-transformer';
import { VendorWallet } from 'src/entities/vendor.wallet.entity';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { TopupWalletDTO } from './dtos/topupwallet.dto';
import { VendorTransactions } from 'src/entities/vendor.transactions.entity';
import { UpdateVendorDTO } from './dtos/updatevendor.dto';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { Coupon } from 'src/entities/coupon.entity';
import { AddCouponDTO } from './dtos/add.coupon.dto';
import { UpdateCouponDTO } from './dtos/update.coupon.dto';
import { CouponStatus } from 'src/enums/coupon.status.enum';
import calculateDistance from 'src/commons/calculator/distance.calc';
import { SocketGateway } from 'src/socket/socket.gateway';
import * as bcrypt from 'bcrypt';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';
import { VendorKYCDTO } from './dtos/vendor.kyc.dto';
import { WorkHour } from 'src/entities/working.hour.entity';
import { OrderStatus } from 'src/enums/order.status.enum';
import { OrderType } from 'src/enums/order.type.enum';
import { TransactionType } from 'src/enums/transaction.type.enum';
import {
  AcceptOrderDTO,
  RejectOrderDTO,
} from 'src/riders/dtos/order.action.dto';
import generateRandomCoupon from 'src/utils/coupon_generator';
import { Order } from 'src/entities/order.entity';
import { SmsService } from 'src/sms/sms.service';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { VendorDocument } from 'src/entities/vendor.document.entity';
import { AddVendorLocationDTO } from './dtos/add.vendor.location.dto';
import { UpdateVendorLocationDTO } from './dtos/update.vendor.location.dto';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { SystemTransactions } from 'src/entities/system.transactions.entity';
import { NotificationService } from 'src/notification/notification.service';
import { PushNotificationType } from 'src/enums/push.notification.type.enum';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { Customer } from 'src/entities/customer.entity';
import { VendorReview } from 'src/entities/vendor.review.entity';
import { RateVendorDTO } from './dtos/rate.vendor.dto';
import { Rider } from 'src/entities/rider.entity';
import { PendingReviews } from 'src/entities/pending.reviews.entity';
import { RevieweeType } from 'src/enums/reviewer.type.enum';
import { VendorNotification } from 'src/entities/vendor.notification.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    @InjectRepository(OperatorDocument)
    private readonly operatorDocRepository: Repository<OperatorDocument>,
    @InjectRepository(VendorDocument)
    private readonly vendorDocRepository: Repository<VendorDocument>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(VendorWallet)
    private readonly walletRepository: Repository<VendorWallet>,
    @InjectRepository(VendorNotification)
    private readonly notificationRepository: Repository<VendorNotification>,
    @InjectRepository(CustomerWallet)
    private readonly customerWalletRepository: Repository<CustomerWallet>,
    @InjectRepository(VendorTransactions)
    private readonly transactionRepository: Repository<VendorTransactions>,
    @InjectRepository(SystemTransactions)
    private readonly systemTransactionRepository: Repository<SystemTransactions>,
    @InjectRepository(VendorLocation)
    private readonly vendorLocationRepository: Repository<VendorLocation>,
    @InjectRepository(WorkHour)
    private readonly workHourRepository: Repository<WorkHour>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private mailerService: MailerService,
    private zoneService: ZonesService,
    private socketGateway: SocketGateway,
    private smsService: SmsService,
    @InjectRepository(SMSProviders)
    private readonly smsRepository: Repository<SMSProviders>,
    @InjectRepository(CommissionAndFee)
    private commissionAndFeeRepository: Repository<CommissionAndFee>,
    private readonly notificationservice: NotificationService,
    @InjectRepository(CustomerTransactions)
    private readonly customerTransactionRepository: Repository<CustomerTransactions>,
    @InjectRepository(VendorReview)
    private readonly vendorReviewRepository: Repository<VendorReview>,
    @InjectRepository(PendingReviews)
    private readonly pendingReviewRepository: Repository<PendingReviews>,
  ) {}

  async findVendors(page: number, limit: number, vendor_type?: VendorType) {
    if (vendor_type) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.vendorRepository
          .createQueryBuilder('vendor') // Alias for the table
          .leftJoinAndSelect('vendor.zone', 'zone') // Join the related admin table
          .leftJoinAndSelect('vendor.owner', 'owner')
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.vendorRepository
          .createQueryBuilder('vendor') // Alias for the table
          .leftJoin('vendor.owner', 'owner') // Join the related vendor table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
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

      const [data, total] = await Promise.all([
        this.vendorRepository
          .createQueryBuilder('vendor') // Alias for the Admin table
          .leftJoinAndSelect('vendor.zone', 'zone') // Join the related admin table
          .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .select([
            'vendor',
            'owner.first_name',
            'owner.last_name',
            'owner.email_address',
            'owner.phone_number',
            'owner.photo_url',
            'owner.operator_type',
            'owner.identity_type',
            'owner.identity_number',
            'owner.last_login',
          ])
          .where('vendor.status != :status', { status: VendorStatus.DELETED })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records returned
          .getMany(), // Execute query to fetch data

        this.vendorRepository
          .createQueryBuilder('vendor') // Alias for the table
          .leftJoin('vendor.owner', 'owner') // Join the related vendor table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
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
  }

  async vendorList() {
    const data = await this.vendorLocationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
      .select([
        'location.id',
        'location.branch_name',
        'vendor.id',
        'vendor.name',
        'vendor.logo',
        'vendor.cover',
      ])
      .where('vendor.status != :status', { status: VendorStatus.DELETED })
      .getRawMany(); // Get raw data without entity transformation

    return data;
  }

  async findVendorLocations(
    page: number,
    limit: number,
    vendor_type?: VendorType,
  ) {
    if (vendor_type) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.vendorLocationRepository
          .createQueryBuilder('location') // Alias for the table
          .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
          .leftJoinAndSelect('vendor.owner', 'owner')
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.vendorLocationRepository
          .createQueryBuilder('location') // Alias for the table
          .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
          .leftJoin('vendor.owner', 'owner') // Join the related vendor table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
          .getCount(), // Count total records for pagination
      ]);

      console.log('VENDOR LOCATS ::: ', data);

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

      const [data, total] = await Promise.all([
        this.vendorLocationRepository
          .createQueryBuilder('location') // Alias for the Admin table
          .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
          .leftJoinAndSelect('vendor.zone', 'zone') // Join the related admin table
          .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          // .select([
          //   'vendor',
          //   'owner.first_name',
          //   'owner.last_name',
          //   'owner.email_address',
          //   'owner.phone_number',
          //   'owner.photo_url',
          //   'owner.operator_type',
          //   'owner.identity_type',
          //   'owner.identity_number',
          //   'owner.last_login',
          // ])
          .where('vendor.status != :status', { status: VendorStatus.DELETED })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records returned
          .getMany(), // Execute query to fetch data

        this.vendorLocationRepository
          .createQueryBuilder('location') // Alias for the Admin table
          .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
          .leftJoin('vendor.owner', 'owner') // Join the related vendor table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .andWhere('vendor.status != :status', {
            status: VendorStatus.DELETED,
          })
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
  }

  async findNearbyVendors(
    page: number,
    limit: number,
    lat: string,
    lng: string,
  ) {
    // Fetch vendors within a 10km radius
    const nearbyVendors = await this.vendorLocationRepository.find({
      where: {
        vendor: { status: VendorStatus.ACTIVE },
      },
      relations: ['vendor'],
    });

    const vendorsWithDistance = await Promise.all(
      nearbyVendors.map(async (vendor) => {
        const distance = await calculateDistance(
          {
            lat: parseFloat(`${lat}`),
            lng: parseFloat(`${lng}`),
          },
          {
            lat: parseFloat(`${vendor.lat}`),
            lng: parseFloat(`${vendor.lng}`),
          },
        );
        return { ...vendor, distance };
      }),
    );

    // First do some Google Map operations
    console.log('LAT ::: ', lat);
    console.log('LNG ::: ', lng);
    // console.log('VWD ::: ', vendorsWithDistance);

    // Sort riders by distance and daily orders
    const sortedVendors = vendorsWithDistance
      .filter((vendor) => vendor.distance <= 100) // Vendors within 50km
      .sort((a, b) => a.distance - b.distance);

    if (sortedVendors.length === 0) {
      return {
        message: 'No nearby vendors found',
        data: [],
      };
    }

    // console.log('NEARESTS 70KM ::: ', sortedVendors);

    return {
      data: sortedVendors,
    };
  }

  async createVendor(
    email_address: string,
    {
      country_code,
      name,
      regNo,
      type,
      website,
      country,
      email_address: ownerEmail,
      first_name,
      intl_phone_format,
      last_name,
      phone_number,
      identity_number,
      identity_type,
      front_view,
      back_view,
      biz_cert,
      zoneId,
    }: CreateVendorDTO,
  ) {
    const adm = await this.adminRepository.findOne({
      where: { email_address: email_address },
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

    // New check if operator currently exists
    const operatorFound = await this.operatorRepository.findOne({
      where: { email_address: ownerEmail },
    });

    // First check if zone exist
    const operatorPhone = await this.operatorRepository.findOne({
      where: { phone_number: phone_number },
    });

    if (operatorFound || operatorPhone) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Operator already exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const zone = await this.zoneService.findZoneById(zoneId);

      if (!zone) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: 'Zone not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // New check if operator email and phone is already taken
      const vendorFound = await this.vendorRepository.findOne({
        where: { name: name },
      });

      if (vendorFound) {
        return {
          message: 'Vendor name already taken',
        };
      }

      const generatedPassword = generateRandomPassword();
      const encodedPassword = await encodePassword(generatedPassword);

      const owner = this.operatorRepository.create({
        email_address: ownerEmail,
        first_name: first_name,
        last_name: last_name,
        identity_type: identity_type,
        identity_number: identity_number,
        user_type: UserType.OPERATOR,
        operator_type: OperatorType.OWNER,
        operator_role: OperatorRole.SUPER,
        intl_phone_format: intl_phone_format,
        phone_number: phone_number,
        country_code: country_code,
        password: encodedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const savedowner = await this.operatorRepository.save(owner);

      const vendor = this.vendorRepository.create({
        name: name,
        regNo: regNo,
        vendor_type: type,
        website: website,
        country: country,
        certificate: biz_cert,
        created_at: new Date(),
        updated_at: new Date(),
      });

      vendor.owner = savedowner;
      vendor.zone = zone;
      const savedVendor = await this.vendorRepository.save(vendor);

      // Now add vendor to operator
      savedowner.vendor = savedVendor;
      await this.operatorRepository.save(savedowner);

      // Now assign a wallet to this vendor
      const wallet = this.walletRepository.create({
        balance: 0.0,
        prev_balance: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      wallet.vendor = savedVendor;
      await this.walletRepository.save(wallet);

      //Now save owner documents here
      const vendorDoc = this.vendorDocRepository.create({
        name: `${first_name} ${last_name}\'s ${identity_type}`,
        front_view: front_view,
        back_view: back_view,
        created_at: new Date(),
        updated_at: new Date(),
      });
      vendorDoc.owner = savedVendor;
      await this.vendorDocRepository.save(vendorDoc);

      //Now save owner documents here
      const operatorDoc = this.operatorDocRepository.create({
        name: `${first_name} ${last_name}\'s ${identity_type}`,
        front_view: front_view,
        back_view: back_view,
        created_at: new Date(),
        updated_at: new Date(),
      });
      operatorDoc.owner = savedowner;
      await this.operatorDocRepository.save(operatorDoc);

      // Now send email to operator with credentials  here
      await this.mailerService.sendMail({
        to: savedowner?.email_address,
        subject: 'New Vendor Operator Onboarding',
        html: userOnboardingEmailContent(
          {
            email_address: savedowner?.email_address,
            type: UserType.OPERATOR,
            operator_type: OperatorType.OWNER,
            password: generatedPassword,
            vendor: savedVendor,
          },
          `${first_name} ${last_name}`,
        ),
      });

      return {
        message: 'Vendor created successfully',
        data: plainToClass(Vendor, savedVendor),
      };
    }
  }

  async findAllCategories(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.categoryRepository
        .createQueryBuilder('category') // Alias for the Admin table
        .leftJoinAndSelect('category.vendor', 'vendor') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.categoryRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findVendorCategories(page: number, limit: number, vendorID: string) {
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
      this.categoryRepository
        .createQueryBuilder('category') // Alias for the Admin table
        .leftJoinAndSelect('category.vendor', 'vendor') // Join the related product table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.categoryRepository
        .createQueryBuilder('category') // Alias for the table
        .leftJoin('category.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
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

  async findVendorBranches(page: number, limit: number, vendorID: string) {
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
      this.vendorLocationRepository
        .createQueryBuilder('location') // Alias for the Admin table
        .leftJoinAndSelect('location.staffs', 'staffs') // Join the related product table
        .select([
          'location',
          'staffs.first_name',
          'staffs.last_name',
          'staffs.email_address',
          'staffs.phone_number',
          'staffs.photo_url',
          'staffs.operator_type',
          'staffs.operator_role',
        ]) // Select only the required fields
        .leftJoinAndSelect('location.vendor', 'vendor') // Join the related product table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.vendorLocationRepository
        .createQueryBuilder('location') // Alias for the table
        .leftJoin('location.staffs', 'staffs') // Join the related vendor table
        .leftJoin('location.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
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

  async updateBranchFCMToken(
    email_address: string,
    payload: UpdateFCMTokenDTO,
  ) {
    console.log('FCM TOKEN PAYLOADD VVVENDODR CHECK ::: ', payload);

    const user = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor', 'vendor_location'],
    });
    if (!user) throw new HttpException('User not found.', HttpStatus.NOT_FOUND);

    if (user.operator_type !== OperatorType.OWNER) {
      const vendorLocation = await this.vendorLocationRepository.findOne({
        where: { id: user?.vendor_location?.id },
      });

      vendorLocation.fcmToken = payload?.token ?? vendorLocation.fcmToken;
      const updatedLocation =
        await this.vendorLocationRepository.save(vendorLocation);

      // const { password, ...others } = updatedUser;
      // console.log('REMOVED PASWORD ::: ', password);

      return {
        message: '',
        user: updatedLocation,
      };
    }

    return;
  }

  async addCategory(email_address: string, payload: AddCategoryDTO) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('OPERATOR INFO ::: ', operator);

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now create category
    const category = this.categoryRepository.create({
      name: payload?.name,
      slug: `${payload?.name}__`.toLowerCase(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    category.vendor = vndr;
    const savedCategory = await this.categoryRepository.save(category);

    this.socketGateway.sendVendorEvent(
      payload?.vendorId,
      'refresh-categories',
      {
        data: savedCategory,
      },
    );
    return savedCategory;
  }

  async updateCategory(
    email_address: string,
    categoryId: string,
    payload: AddCategoryDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now create category
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, vendor: vndr },
    });

    if (!category) {
      throw new HttpException(
        {
          message: 'No category record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedCategory = await this.categoryRepository.update(
      {
        id: category.id,
      },
      { name: payload?.name },
    );

    this.socketGateway.sendVendorEvent(
      payload?.vendorId,
      'refresh-categories',
      {
        data: updatedCategory,
      },
    );

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async deleteCategory(operatorEmail: string, categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['vendor'],
    });

    if (!category) {
      throw new HttpException(
        {
          message: 'Category not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: operatorEmail },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'No operator record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now check if this vendor owns this category;
    if (operator?.vendor?.id !== category?.vendor?.id) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.categoryRepository.delete({ id: categoryId });
    this.socketGateway.sendVendorEvent(
      category?.vendor?.id,
      'refresh-categories',
      {
        data: null,
      },
    );
    return {
      message: 'Category deleted successfully',
    };
  }

  async updateVendor(
    email_address: string,
    vendorId: string,
    payload: UpdateVendorDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now check if this vendor owns this category;
    if (operator?.vendor?.id !== vndr?.id) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload?.zoneId) {
      //First locate zone
      const zone = await this.zoneService.findZoneById(payload?.zoneId);
      const { zoneId, ...rest } = payload;
      console.log('IGNORED :: ', zoneId);

      const ven = this.vendorRepository.create({
        ...vndr,
        ...rest,
      });
      ven.zone = zone;
      const updateVendor = await this.vendorRepository.save(ven);

      return {
        message: 'Vendor updated successfully',
        data: updateVendor,
      };
    } else {
      const { zoneId, ...elim } = payload;
      console.log('Zone .::: ', zoneId);

      // Merge the payload into the existing product object
      const uvnd = this.vendorRepository.create({
        ...vndr,
        ...elim,
      });

      const updateVendor = await this.vendorRepository.save(uvnd);
      return {
        message: 'Vendor updated successfully',
        data: updateVendor,
      };
    }
  }

  async adminUpdateVendor(
    email_address: string,
    vendorId: string,
    payload: UpdateVendorDTO,
  ) {
    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!admin) {
      throw new HttpException(
        {
          message: 'Admin user not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (admin?.access !== AdminAccess.READ_WRITE) {
      throw new HttpException(
        {
          message: 'Insufficient privilege. Operation not allowed!',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.zoneId) {
      //First locate zone
      const zone = await this.zoneService.findZoneById(payload?.zoneId);
      const { zoneId, ...rest } = payload;
      console.log('IGNORED :: ', zoneId);

      const ven = this.vendorRepository.create({
        ...vndr,
        ...rest,
      });
      ven.zone = zone;
      const updateVendor = await this.vendorRepository.save(ven);

      return {
        message: 'Vendor updated successfully',
        data: updateVendor,
      };
    } else {
      const { zoneId, ...elim } = payload;
      console.log('Zone .::: ', zoneId);

      // Merge the payload into the existing product object
      const uvnd = this.vendorRepository.create({
        ...vndr,
        ...elim,
      });

      const updateVendor = await this.vendorRepository.save(uvnd);
      return {
        message: 'Vendor updated successfully',
        data: updateVendor,
      };
    }
  }

  async completeKYC(email_address: string, payload: VendorKYCDTO) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: operator?.vendor?.id },
    });

    if (!vendor) {
      throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
    }

    // Now complete KYC
    vendor.cover = payload.cover;
    vendor.about = payload?.about;
    vendor.is_kyc_completed = true;
    vendor.kyc_completed_at = new Date();
    vendor.updated_at = new Date();

    await this.vendorRepository.save(vendor);

    // Now add business schedule here
    const workHour = await this.workHourRepository.findOne({
      where: { vendor: { id: vendor?.id } },
    });

    if (workHour) {
      // Update here instead
      workHour.mon_open =
        payload?.business_schedule.mon_open ?? workHour.mon_open;
      workHour.mon_close =
        payload?.business_schedule.mon_close ?? workHour.mon_close;
      workHour.tue_open =
        payload?.business_schedule.tue_open ?? workHour.tue_open;
      workHour.tue_close =
        payload?.business_schedule.tue_close ?? workHour.tue_close;
      workHour.wed_open =
        payload?.business_schedule.wed_open ?? workHour.wed_open;
      workHour.wed_close =
        payload?.business_schedule.wed_close ?? workHour.wed_close;
      workHour.thu_open =
        payload?.business_schedule.thu_open ?? workHour.thu_open;
      workHour.thu_close =
        payload?.business_schedule.thu_close ?? workHour.thu_close;
      workHour.fri_open =
        payload?.business_schedule.fri_open ?? workHour.fri_open;
      workHour.fri_close =
        payload?.business_schedule.fri_close ?? workHour.fri_close;
      workHour.sat_open =
        payload?.business_schedule.sat_open ?? workHour.sat_open;
      workHour.sat_close =
        payload?.business_schedule.sat_close ?? workHour.sat_close;
      workHour.sun_open =
        payload?.business_schedule.sun_open ?? workHour.sun_open;
      workHour.sun_close =
        payload?.business_schedule.sun_close ?? workHour.sun_close;
      workHour.updated_at = new Date();

      await this.workHourRepository.save(workHour);
    } else {
      const newWorkHour = this.workHourRepository.create({
        mon_open: payload?.business_schedule.mon_open,
        mon_close: payload?.business_schedule.mon_close,
        tue_open: payload?.business_schedule.tue_open,
        tue_close: payload?.business_schedule.tue_close,
        wed_open: payload?.business_schedule.wed_open,
        wed_close: payload?.business_schedule.wed_close,
        thu_open: payload?.business_schedule.thu_open,
        thu_close: payload?.business_schedule.thu_close,
        fri_open: payload?.business_schedule.fri_open,
        fri_close: payload?.business_schedule.fri_close,
        sat_open: payload?.business_schedule.sat_open,
        sat_close: payload?.business_schedule.sat_close,
        sun_open: payload?.business_schedule.sun_open,
        sun_close: payload?.business_schedule.sun_close,
        created_at: new Date(),
        updated_at: new Date(),
      });

      newWorkHour.vendor = vendor;
      await this.workHourRepository.save(newWorkHour);
    }

    return {
      message: 'KYC completed successfully',
      user: operator,
    };
  }

  async topupWallet(walletID: string, { amount, vendorId }: TopupWalletDTO) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        {
          message: 'Vendor not found!',
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

    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException(
        {
          message: 'Vendor account not active!',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now update venddor wallet here
    const balance = wallet.balance;
    wallet.prev_balance = balance;
    wallet.balance = balance + amount;
    wallet.updated_at = new Date();
    const walletUpdate = await this.walletRepository.save(wallet);

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
        .leftJoinAndSelect('wallet.vendor', 'vendor') // Join the related product table
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

  async findVendorWallet(vendorID: string) {
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

    // Retrieve the wallet belonging to the vendor
    const wallet = await this.walletRepository.findOne({
      where: { vendor: { id: vendorID } }, // Ensure nested object is handled correctly
      relations: ['vendor'], // Include vendor relationship if needed
    });

    if (!wallet) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Wallet not found for this vendor',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return wallet;
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
      .leftJoinAndSelect('transaction.vendor_location', 'vendor_location')
      .leftJoinAndSelect('transaction.vendor', 'vendor')
      .leftJoinAndSelect('vendor.owner', 'owner');

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

  async findVendorTransactions(
    page: number,
    limit: number,
    vendorID: string,
    startDate?: Date,
    endDate?: Date,
  ) {
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

    // Create the base query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.vendor', 'vendor')
      .where('vendor.id = :vendorID', { vendorID });

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
        .leftJoin('transaction.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
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

  async findVendorLocationTransactions(
    page: number,
    limit: number,
    locationID: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const vendorLocation = await this.vendorLocationRepository.findOne({
      where: { id: locationID },
    });

    if (!vendorLocation) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Vendor location not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Create the base query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.vendor', 'vendor')
      .leftJoinAndSelect('transaction.vendor_location', 'vendor_location')
      .where('vendor_location.id = :locationID', { locationID });

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
        .leftJoin('transaction.vendor', 'vendor') // Join the related vendor table
        .leftJoin('transaction.vendor_location', 'vendor_location') // Join the related vendor table
        .where('vendor_location.id = :locationID', { locationID }) // Filter by vendor ID
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

  async findVendorStaffs(page: number, limit: number, vendorID: string) {
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
      this.operatorRepository
        .createQueryBuilder('operator')
        .leftJoinAndSelect('operator.vendor_location', 'vendor_location')
        .leftJoinAndSelect('operator.vendor', 'vendor')
        .where('vendor.id = :vendorID', { vendorID })
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.operatorRepository
        .createQueryBuilder('operator') // Alias for the table
        .leftJoin('operator.vendor_location', 'vendor_location') // Join the related vendor table
        .leftJoin('operator.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
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

  async addVendorLocation(
    email_address: string,
    payload: AddVendorLocationDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'You are strictly forbidden!!',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    console.log('OPERATOR INFO ::: ', operator);

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const vendorLocation = await this.vendorLocationRepository.findOne({
      where: { branch_name: payload?.branch_name, vendor: { id: vndr.id } },
    });

    if (vendorLocation) {
      throw new HttpException(
        'Vendor branch name already added!',
        HttpStatus.FORBIDDEN,
      );
    }

    const vendorLocationPhone = await this.vendorLocationRepository.findOne({
      where: {
        intl_phone_format: payload?.intl_phone_format,
        vendor: { id: vndr.id },
      },
    });

    if (vendorLocationPhone) {
      throw new HttpException(
        'You have used phone number in another location!',
        HttpStatus.FORBIDDEN,
      );
    }

    // Now create coupon
    // const uniqueCode = generateRandomCoupon(8, vndr.name.toUpperCase());
    const newVendorLocation = this.vendorLocationRepository.create({
      branch_name: payload?.branch_name,
      city: payload?.city,
      region: payload?.region,
      street: payload.street,
      business_email: payload?.email_address,
      business_phone: payload?.natl_phone_format,
      intl_phone_format: payload?.intl_phone_format,
      lat: payload?.latitude,
      lng: payload?.longitude,
      iso_code: payload?.iso_code,
      created_at: new Date(),
      updated_at: new Date(),
    });
    newVendorLocation.vendor = vndr;

    const savedLocation =
      await this.vendorLocationRepository.save(newVendorLocation);

    this.socketGateway.sendVendorEvent(vndr?.id, 'refresh-locations', {
      data: null,
    });

    return {
      message: 'Business location added successfully',
      data: savedLocation,
    };
  }

  async updateVendorLocation(
    email_address: string,
    locationID: string,
    payload: UpdateVendorLocationDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'You are strictly forbidden!!',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now update coupon
    const loc = await this.vendorLocationRepository.findOne({
      where: { id: locationID, vendor: { id: payload?.vendorId } },
    });

    if (!loc) {
      throw new HttpException(
        {
          message: 'No matching vendor location found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    loc.branch_name = payload?.branch_name ?? loc.branch_name;
    loc.business_email = payload?.email_address ?? loc.business_email;
    loc.business_phone = payload?.natl_phone_format ?? loc.business_phone;
    loc.intl_phone_format = payload?.intl_phone_format ?? loc.intl_phone_format;
    loc.city = payload?.city ?? loc.city;
    loc.region = payload?.region ?? loc.region;
    loc.street = payload?.street ?? loc.street;
    loc.lat = payload?.latitude ?? loc.lat;
    loc.lng = payload?.longitude ?? loc.lng;
    loc.updated_at = new Date();

    const updatedLocation = await this.vendorLocationRepository.save(loc);
    this.socketGateway.sendEvent(
      operator?.id,
      UserType.OPERATOR,
      'refresh-locations',
      {
        data: null,
      },
    );

    this.socketGateway.sendVendorEvent(vndr?.id, 'refresh-locations', {
      data: null,
    });

    return {
      message: 'Vendor location updated successfully',
      data: updatedLocation,
    };
  }

  async findAllVendorLocations(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorLocationRepository
        .createQueryBuilder('location') // Alias for the Admin table
        .leftJoinAndSelect('location.vendor', 'vendor') // Join the related admin table
        .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
        .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
        .select([
          'vendor',
          'owner.first_name',
          'owner.last_name',
          'owner.email_address',
          'owner.phone_number',
          'owner.photo_url',
        ])
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorLocationRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async deleteVendorLocation(operatorEmail: string, couponId: string) {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
      relations: ['vendor'],
    });

    if (!coupon) {
      throw new HttpException(
        {
          message: 'Coupon not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: operatorEmail },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'No operator record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now check if this vendor owns this category;
    if (operator?.vendor?.id !== coupon?.vendor?.id) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.couponRepository.delete({ id: couponId });
    return {
      message: 'Coupon deleted successfully',
    };
  }

  async findAllVendorDocuments(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorDocRepository
        .createQueryBuilder('documentRepo') // Alias for the Admin table
        .leftJoinAndSelect('documentRepo.owner', 'owner') // Join the related product table
        .orderBy('documentRepo.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorDocRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findAllOperatorDocuments(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.vendorDocRepository
        .createQueryBuilder('documentRepo') // Alias for the Admin table
        .leftJoinAndSelect('documentRepo.owner', 'owner') // Join the related product table
        .orderBy('documentRepo.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.vendorDocRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async addCoupon(email_address: string, payload: AddCouponDTO) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('OPERATOR INFO ::: ', operator);

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const coupon = await this.couponRepository.findOne({
      where: { code: payload?.code, vendor: { id: vndr.id } },
    });

    if (coupon) {
      throw new HttpException(
        'Coupon code already used by vendor!',
        HttpStatus.FORBIDDEN,
      );
    }

    // Now create coupon
    // const uniqueCode = generateRandomCoupon(8, vndr.name.toUpperCase());
    const newCoupon = this.couponRepository.create({
      name: payload?.name,
      code: payload?.code,
      image_url: payload?.image_url,
      discount: payload.discount,
      discount_type: payload?.discountType,
      expires_at: payload?.expires_at,
      coupon_status:
        payload?.is_active === true
          ? CouponStatus.ACTIVE
          : CouponStatus.INACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });
    newCoupon.vendor = vndr;

    const savedCoupon = await this.couponRepository.save(newCoupon);

    this.socketGateway.sendVendorEvent(vndr?.id, 'refresh-coupons', {
      data: null,
    });

    // Notify all customers in the same zone as venddor location or use gEO coordinates

    try {
      const customers = await this.customerRepository.find({});
      for (let index = 0; index < customers?.length; index++) {
        const customer = customers[index];
        try {
          await this.notificationservice.sendPushNotification(
            customer?.fcmToken,
            {
              message: `A new offer (${savedCoupon?.code}) is available`,
              notificatioonType: PushNotificationType.OFFER,
              title: 'New Offer Available',
              itemId: savedCoupon?.id,
            },
          );
        } catch (error) {
          console.log('ERROR :: ', error);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return savedCoupon;
  }

  async updateCoupon(
    email_address: string,
    couponId: string,
    payload: UpdateCouponDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'Vendor operator not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.vendor?.id !== payload?.vendorId) {
      throw new HttpException(
        {
          message: 'Unknown vendor operator',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const vndr = await this.vendorRepository.findOne({
      where: { id: payload?.vendorId },
    });

    if (!vndr) {
      throw new HttpException(
        {
          message: 'No vendor record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now update coupon
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, vendor: { id: payload?.vendorId } },
    });

    if (!coupon) {
      throw new HttpException(
        {
          message: 'No matching coupon found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    coupon.discount = payload?.discount ?? coupon.discount;
    coupon.discount_type = payload?.discountType ?? coupon.discount_type;
    coupon.expires_at = payload?.expiresAt ?? coupon.expires_at;
    coupon.name = payload?.name ?? coupon.name;
    coupon.coupon_status = payload?.status ?? coupon.coupon_status;
    coupon.image_url = payload?.imageUrl ?? coupon.image_url;
    coupon.updated_at = new Date();

    const updatedCoupon = await this.couponRepository.save(coupon);
    this.socketGateway.sendEvent(
      operator?.id,
      UserType.OPERATOR,
      'refresh-coupons',
      {
        data: null,
      },
    );

    this.socketGateway.sendVendorEvent(vndr?.id, 'refresh-coupons', {
      data: null,
    });

    return {
      message: 'Coupon updated successfully',
      data: updatedCoupon,
    };
  }

  async findVendorCoupons(page: number, limit: number, vendorID: string) {
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
      this.couponRepository
        .createQueryBuilder('coupon')
        .leftJoinAndSelect('coupon.vendor', 'vendor')
        .where('vendor.id = :vendorID', { vendorID })
        .orderBy('coupon.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.couponRepository
        .createQueryBuilder('coupon') // Alias for the table
        .leftJoin('coupon.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
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

  async findAllCoupons(page: number, limit: number, status?: CouponStatus) {
    if (status) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.couponRepository
          .createQueryBuilder('coupon') // Alias for the table
          .leftJoinAndSelect('coupon.vendor', 'vendor') // Join the related admin table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('coupon.status = :status', { status }) // Filter by vendor ID
          .orderBy('coupon.created_at', 'DESC')
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.couponRepository
          .createQueryBuilder('coupon') // Alias for the table
          .leftJoin('coupon.vendor', 'vendor') // Join the related vendor table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .where('coupon.status = :status', { status }) // Filter by vendor ID
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

      const [data, total] = await Promise.all([
        this.couponRepository
          .createQueryBuilder('coupon') // Alias for the Admin table
          .leftJoinAndSelect('coupon.vendor', 'vendor') // Join the related admin table
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .leftJoinAndSelect('coupon.customer', 'customer') // Join the related admin table
          .select([
            'coupon',
            'customer.first_name',
            'customer.last_name',
            'customer.email_address',
            'customer.phone_number',
            'customer.photo_url',
          ])
          // .where('vendor.status != :status', { status: VendorStatus.DELETED })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records returned
          .getMany(), // Execute query to fetch data
        this.vendorRepository.count(), // Count total documents for calculating total pages
      ]);

      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        perPage: limit,
      };
    }
  }

  async deleteCoupon(operatorEmail: string, couponId: string) {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
      relations: ['vendor'],
    });

    if (!coupon) {
      throw new HttpException(
        {
          message: 'Coupon not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: operatorEmail },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        {
          message: 'No operator record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (operator?.operator_type !== OperatorType.OWNER) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now check if this vendor owns this category;
    if (operator?.vendor?.id !== coupon?.vendor?.id) {
      throw new HttpException(
        {
          message: 'Operation not allowed',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.couponRepository.delete({ id: couponId });
    return {
      message: 'Coupon deleted successfully',
    };
  }

  async setWalletPin(email_address: string, payload: UpdateWalletPINDTO) {
    if (!payload?.vendor_id) {
      throw new HttpException('Vendor ID is required', HttpStatus.BAD_REQUEST);
    }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    }

    if (operator.operator_type !== OperatorType.OWNER) {
      throw new HttpException('You are forbidden!', HttpStatus.FORBIDDEN);
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendor_id },
    });

    if (!vendor) {
      throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
    }

    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException('Vendor not active!', HttpStatus.FORBIDDEN);
    }

    // Now find wallett
    const wallet = await this.walletRepository.findOne({
      where: { vendor: { id: vendor?.id } },
    });

    if (!wallet) {
      throw new HttpException('Vendor wallet not found', HttpStatus.NOT_FOUND);
    }

    if (vendor?.wallet_pin) {
      // It has been addded before, so compare with new pin before updting
      if (!payload?.old_pin) {
        throw new HttpException(
          'old wallet pin is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const savedPin = vendor?.wallet_pin;
      if (vendor && !bcrypt.compareSync(payload?.old_pin, savedPin)) {
        throw new HttpException(
          'Incorrect wallet pin entered',
          HttpStatus.BAD_REQUEST,
        );
      } else if (vendor && bcrypt.compareSync(payload?.old_pin, savedPin)) {
        // All good
        // Noow encodde new pin
        const encodedPassword = await encodePassword(payload.new_pin);
        vendor.wallet_pin = encodedPassword;
        vendor.updated_at = new Date();

        await this.vendorRepository.save(vendor);
        return {
          message: 'Wallet pin updated successfully',
        };
      }
    } else {
      // Create new pin
      const encodedPassword = await encodePassword(payload.new_pin);
      vendor.wallet_pin = encodedPassword;
      vendor.updated_at = new Date();

      await this.vendorRepository.save(vendor);
      return {
        message: 'Wallet pin set successfully',
      };
    }
  }

  async acceptOrder(email_address: string, payload: AcceptOrderDTO) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor', 'vendor_location'],
    });

    if (!operator) {
      throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    }

    if (!operator.is_email_verified || !operator.is_kyc_completed) {
      throw new HttpException(
        'You must complete your KYC to accept orders',
        HttpStatus.FORBIDDEN,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
      relations: ['vendor', 'customer', 'vendor_location'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.order_type !== OrderType.PARCEL_ORDER) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: order.vendor.id },
      });

      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      if (!vendor.is_kyc_completed) {
        throw new HttpException(
          'You must complete vendor KYC to accept orders',
          HttpStatus.FORBIDDEN,
        );
      }

      const vendorLocation = await this.vendorLocationRepository.findOne({
        where: { id: order.vendor_location?.id },
      });

      if (!vendorLocation) {
        throw new HttpException(
          'Vendor location not found',
          HttpStatus.NOT_FOUND,
        );
      }

      order.order_status = OrderStatus.PROCESSING;
      order.updated_at = new Date();
      const updatedOrder = await this.orderRepository.save(order);

      this.socketGateway.sendEvent(
        operator.id,
        UserType.OPERATOR,
        'refresh-orders',
        {
          message: 'order accepted by you',
        },
      );

      this.socketGateway.sendEvent(
        order?.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'order accepted by vendor',
        },
      );
      // Notify the vendor that rider is on his way
      this.socketGateway.sendVendorNotification(order?.vendor?.id, {
        message: 'Ensure order is ready. Do not keep rider waiting',
        title: 'Order Accepted By You',
        order: order,
      });

      // Now send access code to vendor
      if (vendorLocation?.intl_phone_format) {
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
            message: `Use the access code below to verify rider. ${order.access_code}`,
            phoneNumber: vendorLocation?.intl_phone_format,
          });

          await this.notificationservice.sendPushNotification(
            order?.customer?.fcmToken,
            {
              message:
                'Your order has been accepted and is currently been processed',
              notificatioonType: PushNotificationType.ORDER,
              title: 'Order Accepted',
              itemId: order?.id,
            },
          );
        } catch (error) {
          console.log(error);
          throw new HttpException(
            `Error occurred sending otp ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return {
          message: 'Order accepted successfully',
          order: updatedOrder,
        };
      }

      // Also send to email
      await this.mailerService.sendMail({
        to: email_address,
        subject: 'Account Password Reset OTP',
        html: `<div>
        <br/>
        <h5>Hi ${vendor.name}</h5>
        <br/>
        <p>Use the access code below. Keep it confidential. You will be required to present it to vendor upon your arrival. </p>
        <strong>${order.access_code}</strong>
        </div>`,
      });
    }
  }

  async rejectOrder(email_address: string, payload: RejectOrderDTO) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    }

    if (!operator.is_email_verified || !operator.is_kyc_completed) {
      throw new HttpException(
        'You must complete your KYC to reject orders',
        HttpStatus.FORBIDDEN,
      );
    }

    const existingFee = await this.commissionAndFeeRepository.find({});
    if (existingFee?.length > 0) {
      throw new HttpException(
        'Fees not setup. Contact support',
        HttpStatus.FORBIDDEN,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: payload?.orderId },
      relations: ['customer'],
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.order_type !== OrderType.PARCEL_ORDER) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: operator.vendor?.id },
      });

      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      if (!vendor.is_kyc_completed) {
        throw new HttpException(
          'You must complete vendor KYC to reject orders',
          HttpStatus.FORBIDDEN,
        );
      }

      const wallet = await this.walletRepository.findOne({
        where: { vendor: { id: vendor?.id } },
      });

      if (!wallet) {
        throw new HttpException(
          'Vendor wallet not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (wallet.balance < existingFee[0]?.rider_order_cancellation) {
        throw new HttpException(
          'Insufficient wallet balance to reject order',
          HttpStatus.FORBIDDEN,
        );
      }

      wallet.prev_balance = wallet.balance;
      wallet.balance =
        wallet.balance - existingFee[0]?.vendor_order_cancellation;

      await this.walletRepository.save(wallet);

      // Now create a transaction to this effect here
      const trans = this.transactionRepository.create({
        amount: existingFee[0]?.vendor_order_cancellation,
        fee: 0,
        transaction_type: TransactionType.WITHDRAWAL,
        summary: 'Order rejection fee',
        tx_ref: `CNL-${order?.order_id}-${generateRandomCoupon(4, vendor?.name)}`,
        status: 'success',
        created_at: new Date(),
        updated_at: new Date(),
      });

      trans.vendor = vendor;
      trans.vendor_location = order.vendor_location;
      await this.transactionRepository.save(trans);

      // Refund the customer here
      const customerWallet = await this.customerWalletRepository.findOne({
        where: { customer: { id: order?.customer?.id } },
      });

      if (!customerWallet) {
        throw new HttpException(
          'Customer wallet not found',
          HttpStatus.NOT_FOUND,
        );
      }

      customerWallet.prev_balance = customerWallet.balance;
      customerWallet.balance =
        customerWallet.balance + order.total_amount + order?.service_charge;
      customerWallet.updated_at = new Date();

      await this.customerWalletRepository.save(customerWallet);

      // Create a transaction to this effect
      const customerTrans = this.customerTransactionRepository.create({
        amount: order?.total_amount + order?.service_charge,
        fee: 0,
        transaction_type: TransactionType.CREDIT,
        summary: 'Order cancellation refund',
        tx_ref: `${order?.order_id}-${generateRandomCoupon(3, order?.customer?.first_name)}`,
        status: 'success',
        created_at: new Date(),
        updated_at: new Date(),
      });

      customerTrans.customer = order.customer;
      await this.customerTransactionRepository.save(customerTrans);

      // Now create a transaction to this effect here
      const systemTrans = this.systemTransactionRepository.create({
        amount: existingFee[0]?.vendor_order_cancellation,
        fee: 0,
        transaction_type: TransactionType.CREDIT,
        summary: 'Order rejection earning',
        tx_ref: `CNL-${order?.order_id}-${generateRandomCoupon(4, vendor?.name)}`,
        status: 'success',
        created_at: new Date(),
        updated_at: new Date(),
      });
      await this.systemTransactionRepository.save(systemTrans);

      // NOw notify customer that order was rejected
      this.socketGateway.sendEvent(
        order?.customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          message: 'Order was Rejected',
        },
      );

      this.socketGateway.sendNotification(
        order?.customer?.id,
        UserType.CUSTOMER,
        {
          title: 'Order Rejected.',
          message: 'Your Order was Rejected. Please re-order again.',
        },
      );

      await this.notificationservice.sendPushNotification(
        order?.customer?.fcmToken,
        {
          message: 'Your order has been rejected',
          notificatioonType: PushNotificationType.ORDER,
          title: 'Order Rejected',
          itemId: order?.id,
        },
      );

      return {
        message: 'Order rejected successfully',
      };
    }
  }

  async rateVendor(payload: RateVendorDTO) {
    // First get vendor
    const vendorLocation = await this.vendorLocationRepository.findOne({
      where: { id: payload?.vendorLocationId },
    });

    if (!vendorLocation) {
      throw new HttpException(
        'Vendor with given ID not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.reviewerType === UserType.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { id: payload?.reviewerId },
      });

      if (!customer) {
        throw new HttpException(
          'Customer with given ID not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Now chek if this customer has rated this vendor before
      const customerRated = await this.vendorReviewRepository.findOne({
        where: { customer: { id: customer?.id } },
      });
      if (customerRated) {
        throw new HttpException(
          'You have already reviewed this vendor',
          HttpStatus.FORBIDDEN,
        );
      }

      // Not yet reviewed. review here
      const newReview = this.vendorReviewRepository.create({
        message: payload?.message,
        rating: payload?.rating,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newReview.vendor_location = vendorLocation;
      newReview.customer = customer;
      const savedReview = await this.vendorReviewRepository.save(newReview);

      // first find all vendor reviews andd then do the math.
      const reviews = await this.vendorReviewRepository.find({
        where: { vendor_location: { id: vendorLocation?.id } },
        relations: ['vendor_location'],
      });

      let ratings = 0;
      for (let index = 0; index < reviews.length; index++) {
        const element = reviews[index];
        ratings = ratings + element?.rating;
      }

      // Now update vendor rating here
      const rater = ratings / reviews?.length;
      vendorLocation.rating = rater;

      await this.vendorLocationRepository.save(vendorLocation);

      // Now clear from pending review if any
      const pendingFound = await this.pendingReviewRepository.findOne({
        where: {
          reviewee_type: RevieweeType.VENDOR,
          customer: { id: customer?.id },
          reviewee_id: vendorLocation?.id,
        },
      });

      if (pendingFound) {
        // Exists. Now delete it here
        await this.pendingReviewRepository.delete({ id: pendingFound?.id });
      }

      // refresh products, orders and vendor_locations here
      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-vendors',
        {
          data: null,
        },
      );

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-favourites',
        {
          data: null,
        },
      );

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-orders',
        {
          data: null,
        },
      );

      return {
        message: 'Vendor rated successfully',
        data: savedReview,
      };
    } else if (payload?.reviewerType === UserType.RIDER) {
      const rider = await this.riderRepository.findOne({
        where: { id: payload?.reviewerId },
      });

      if (!rider) {
        throw new HttpException(
          'Rider with given ID not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Now chek if this customer has rated this vendor before
      const riderRated = await this.vendorReviewRepository.findOne({
        where: { rider: { id: rider?.id } },
      });
      if (riderRated) {
        throw new HttpException(
          'You have already reviewed this vendor',
          HttpStatus.FORBIDDEN,
        );
      }

      // Not yet reviewed. review here
      const newReview = this.vendorReviewRepository.create({
        message: payload?.message,
        rating: payload?.rating,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newReview.vendor_location = vendorLocation;
      newReview.rider = rider;
      const savedReview = await this.vendorReviewRepository.save(newReview);

      // first find all vendor reviews and then do the math.
      const reviews = await this.vendorReviewRepository.find({
        where: { vendor_location: { id: vendorLocation?.id } },
        relations: ['vendor_location'],
      });

      let ratings = 0;
      for (let index = 0; index < reviews.length; index++) {
        const element = reviews[index];
        ratings = ratings + element?.rating;
      }

      // Now update vendor rating here
      const rater = ratings / reviews?.length;
      vendorLocation.rating = rater;

      await this.vendorLocationRepository.save(vendorLocation);

      // Now clear from pending review if any
      const pendingFound = await this.pendingReviewRepository.findOne({
        where: {
          reviewee_type: RevieweeType.VENDOR,
          rider: { id: rider?.id },
          reviewee_id: vendorLocation?.id,
        },
      });

      if (pendingFound) {
        // Exists. Now delete it here
        await this.pendingReviewRepository.delete({ id: pendingFound?.id });
      }

      // refresh products, orders and vendor_locations here
      this.socketGateway.sendEvent(
        rider?.id,
        UserType.RIDER,
        'refresh-vendors',
        {
          data: null,
        },
      );

      this.socketGateway.sendEvent(
        rider?.id,
        UserType.RIDER,
        'refresh-orders',
        {
          data: null,
        },
      );

      return {
        message: 'Vendor rated successfully',
        data: savedReview,
      };
    } else {
      throw new HttpException('Forbidden reviewer type', HttpStatus.FORBIDDEN);
    }
  }

  async findVendorNotifications(page: number, limit: number, vendorID: string) {
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

    const [data, total, unreadCount] = await Promise.all([
      this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.vendor', 'vendor')
        .leftJoinAndSelect('notification.rider', 'rider')
        .where('vendor.id = :vendorID', { vendorID })
        .orderBy('notification.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.notificationRepository
        .createQueryBuilder('notification') // Alias for the table
        .leftJoin('notification.vendor', 'vendor') // Join the related vendor table
        .where('vendor.id = :vendorID', { vendorID }) // Filter by vendor ID
        .getCount(), // Count total records for pagination

      this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoin('notification.vendor', 'vendor')
        .where('vendor.id = :vendorID', { vendorID })
        .andWhere('notification.is_read = :isRead', { isRead: false }) // Count only unread notifications
        .getCount(),
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
      unreadNotifications: unreadCount, // Include unread count in the response
    };
  }

  async markAllAsRead(vendorID: string) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(VendorNotification)
      .set({ is_read: true })
      .where('vendor.id = :vendorID AND is_read = false', { vendorID })
      .execute();

    return { message: '' };
  }

  async couponCronJob() {
    // Cron Job to automatically expire a coupon code on the expiration date
  }
}
