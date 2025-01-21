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
import { OperatorType } from 'src/enums/operator.type.enum';
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

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    @InjectRepository(OperatorDocument)
    private readonly documentRepository: Repository<OperatorDocument>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(VendorWallet)
    private readonly walletRepository: Repository<VendorWallet>,
    @InjectRepository(VendorTransactions)
    private readonly transactionRepository: Repository<VendorTransactions>,
    private mailerService: MailerService,
    private zoneService: ZonesService,
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
          .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
          .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
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

  async createVendor(
    email_address: string,
    {
      city,
      country,
      country_code,
      logo,
      name,
      regNo,
      state: region,
      street,
      type,
      website,
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
        intl_phone_format: intl_phone_format,
        phone_number: phone_number,
        country_code: country_code,
        password: encodedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const savedowner = await this.operatorRepository.save(owner);

      const vendor = this.vendorRepository.create({
        city: city,
        country: country,
        name: name,
        regNo: regNo,
        region: region,
        vendor_type: type,
        logo: logo,
        street: street,
        website: website,
        certificate: biz_cert,
        created_at: new Date(),
        updated_at: new Date(),
      });

      vendor.owner = savedowner;
      vendor.zone = zone;
      vendor.staffs = [savedowner];
      const savedVendor = await this.vendorRepository.save(vendor);

      // Now dd vendor to operator
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
      const doc = this.documentRepository.create({
        name: `${first_name} ${last_name}\'s ${identity_type}`,
        front_view: front_view,
        back_view: back_view,
        created_at: new Date(),
        updated_at: new Date(),
      });
      doc.owner = savedowner;
      await this.documentRepository.save(doc);

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
    return savedCategory;
  }

  async updateCategory(
    email_address: string,
    categoryId: string,
    payload: AddCategoryDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
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
    return {
      message: 'Category deleted successfully',
    };
  }

  async updateInformation(
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
      const { zoneId, staffs, ...rest } = payload;
      console.log('IGNORED :: ', zoneId, staffs);

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
      const { zoneId, staffs, ...elim } = payload;
      console.log('Zone .::: ', zoneId, staffs);

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

  async updateVendor(
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
      const { zoneId, staffs, ...rest } = payload;
      console.log('IGNORED :: ', zoneId, staffs);

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
      const { zoneId, staffs, ...elim } = payload;
      console.log('Zone .::: ', zoneId, staffs);

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
      .leftJoinAndSelect('transaction.vendor', 'vendor');

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
        .leftJoinAndSelect('operator.vendor', 'vendor')
        .where('vendor.id = :vendorID', { vendorID })
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.operatorRepository
        .createQueryBuilder('operator') // Alias for the table
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
}
