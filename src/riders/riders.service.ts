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

@Injectable()
export class RidersService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(RiderWallet)
    private readonly walletRepository: Repository<RiderWallet>,
    @InjectRepository(RiderTransactions)
    private readonly transactionRepository: Repository<RiderTransactions>,
    @InjectRepository(RiderDocument)
    private readonly documentRepository: Repository<RiderDocument>,
    @InjectRepository(AdminActivity)
    private readonly activitiesRepository: Repository<AdminActivity>,
    private zoneService: ZonesService,
    private mailerService: MailerService,
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

    console.log('FOUND RIDER :: ', foundUser);

    return foundUser;
  }

  findUserById(id: string) {
    return this.riderRepository.findOne({ where: { id: id } });
  }

  async updateUser(id: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    try {
      if (!payload) {
        throw new HttpException(
          'Payload not provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.riderRepository.findOne({
        where: { id: id },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      await this.riderRepository.update({ id: id }, { ...payload });
      const updatedUser = await this.riderRepository.findOne({
        where: { id: id },
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
      .where('rider.id = :riderID', { riderID });

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
}
