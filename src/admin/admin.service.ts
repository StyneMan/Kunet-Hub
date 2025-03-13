import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { encodePassword } from 'src/utils/bcrypt';
import { Repository } from 'typeorm';
import { CreateAdminDTO } from './dtos/createadmin.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnboardingEmailContent } from 'src/utils/email';
import { UserStatus } from 'src/enums/user.status.enum';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { UserType } from 'src/enums/user.type.enum';
import { Rider } from 'src/entities/rider.entity';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';
import { AdminNotification } from 'src/entities/admin.notification.entity';
import { UpdateWalletPINDTO } from 'src/commons/dtos/update.wallet.pin.dto';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import * as bcrypt from 'bcrypt';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { AdminWallet } from 'src/entities/admin.wallet.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(AdminActivity)
    private readonly activitiesRepository: Repository<AdminActivity>,
    @InjectRepository(AdminNotification)
    private readonly notificationRepository: Repository<AdminNotification>,
    private mailerService: MailerService,
    @InjectRepository(AdminWallet)
    private readonly walletRepository: Repository<AdminWallet>,
  ) {}

  async findAdmins(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.adminRepository
        .createQueryBuilder('admin') // Alias for the Admin table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.adminRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createAdmin(createAdminDto: CreateAdminDTO) {
    try {
      // First check if customer already exist
      const adminFound = await this.adminRepository.findOne({
        where: { email_address: createAdminDto?.email_address },
      });
      if (adminFound) {
        throw new HttpException(
          {
            message: 'Email address already taken!',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // First check if phone exist
      const adminPhone = await this.adminRepository.findOne({
        where: { phone_number: createAdminDto?.phone_number },
      });
      if (adminPhone) {
        throw new HttpException(
          {
            message: 'Phone number already taken!',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const generatedPassword = generateRandomPassword();
      const encodedPassword = await encodePassword(generatedPassword);
      const newAdmin = this.adminRepository.create({
        ...createAdminDto,
        password: encodedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.adminRepository.save(newAdmin);

      // Now send this passwordd to admin's email address
      await this.mailerService.sendMail({
        to: createAdminDto?.email_address,
        subject: 'New Admin Onboarding',
        html: userOnboardingEmailContent(
          {
            email_address: createAdminDto.email_address,
            type: UserType.ADMIN,
            password: generatedPassword,
            role: createAdminDto.role,
            access: createAdminDto.access,
          },
          createAdminDto?.first_name,
        ),
      });

      const { password, ...rest } = newAdmin;
      console.log('REMOVED PASS ', password);

      return {
        message: 'Admin created successfully',
        data: rest,
      };
    } catch (error) {
      console.log('THE DUPPLICATION ERROR HERE ::: ', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          {
            message: `${error?.message ?? 'Phone number already taken'}`,
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error; // Re-throw other unhandled errors
    }
  }

  async findAdminByAdminname(email_address: string): Promise<Admin> {
    console.log('EMAIL ADDRESS CHECK HERE ::: ', email_address);

    const foundAdmin = await this.adminRepository.findOne({
      where: { email_address },
    });

    return foundAdmin;
  }

  async findAdminByPhone(phone_number: string): Promise<Admin> {
    const foundAdmin = await this.adminRepository.findOne({
      where: { phone_number: phone_number },
    });
    return foundAdmin;
  }

  findAdminById(id: string) {
    return this.adminRepository.findOne({ where: { id: id } });
  }

  async findCurrentAdmin(email_address: string) {
    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!admin) {
      return null;
    }

    const { password, ...rest } = admin;
    console.log(password);

    return rest;
  }

  async adminUpdateAdmin(email_address: string, id: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    //First check if user exist and marketplace exists
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

    const user = await this.adminRepository.findOne({
      where: { id: id },
    });

    if (!user)
      throw new HttpException('No record found.', HttpStatus.NOT_FOUND);

    await this.adminRepository.update({ id }, { ...payload });
    const updatedAdmin = await this.adminRepository.findOne({
      where: { id: id },
    });

    const activity = this.activitiesRepository.create({
      name: 'Admin Update',
      description: `You updated ${updatedAdmin?.first_name} ${updatedAdmin?.last_name}'s profile on ${new Date().toLocaleString('en-GB')}`,
      user: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.activitiesRepository.save(activity);

    const { password, ...data } = updatedAdmin;
    console.log('REMOVED PASWORD ::: ', password);

    return {
      message: 'Admin profile updated successfully',
      user: data,
    };
  }

  async updateAdmin(email_address: string, payload: any) {
    console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    console.log('EMA ::: ', email_address);

    const user = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!user) {
      throw new HttpException('No record found.', HttpStatus.NOT_FOUND);
    }

    await this.adminRepository.update(
      { email_address: email_address },
      { ...payload },
    );
    const updatedAdmin = await this.adminRepository.findOne({
      where: {
        email_address: email_address,
      },
    });

    const { password, ...data } = updatedAdmin;
    console.log('REMOVED PASWORD ::: ', password);

    return {
      message: 'Admin profile updated successfully',
      user: data,
    };
  }

  async suspendAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
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

      const foundAdmin = await this.adminRepository.findOne({
        where: { id: id },
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.adminRepository.update(
        { id: foundAdmin?.id }, // Update condition
        { status: UserStatus.SUSPENDED, updated_at: new Date() }, // New values to set
      );

      const activity = this.activitiesRepository.create({
        name: 'Admin Account Suspension',
        description: `${adm?.first_name} ${adm?.last_name} suspended the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
      activity.user = adm;
      this.activitiesRepository.save(activity);

      return {
        message: 'Admin account suspended successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async pardonAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
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

      const foundAdmin = await this.adminRepository.findOne({
        where: { id: id },
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.adminRepository.update(
        { id: id },
        { status: UserStatus.ACTIVE, updated_at: new Date() },
      );

      const activity = this.activitiesRepository.create({
        name: 'Admin Account Pardoned',
        description: `${adm?.first_name} ${adm?.last_name} pardoned the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        created_at: new Date(),
        updated_at: new Date(),
      });

      activity.user = adm;
      await this.activitiesRepository.save(activity);

      return {
        message: 'Admin account pardoned successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        where: { email_address: email_address },
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (adm.role !== 'manager' && adm.access !== 'read/write') {
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

  async allActivities(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.activitiesRepository
        .createQueryBuilder('activity') // Alias for the table
        .leftJoinAndSelect('activity.admin', 'admin') // Join the related admin table
        .select([
          'activity',
          'admin.first_name',
          'admin.last_name',
          'admin.emails_address',
          'admin.phone_number',
          'admin.photo_url',
          'admin.role',
          'admin.access',
        ]) // Select only the required fields
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data
      this.activitiesRepository.count(), // Count total records for pagination
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

  async updateAdminFCMToken(email_address: string, payload: UpdateFCMTokenDTO) {
    console.log('FCM TOKEN PAYLOADD VVVENDODR CHECK ::: ', payload);

    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });
    if (!admin)
      throw new HttpException('Admin not found.', HttpStatus.NOT_FOUND);

    admin.fcmToken = payload?.token ?? admin.fcmToken;
    const updatedAdmin = await this.adminRepository.save(admin);

    const { password, ...others } = updatedAdmin;
    console.log('REMOVED PASWORD ::: ', password);

    return {
      message: '',
      user: others,
    };
  }

  async findAdminNotifications(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total, unreadCount] = await Promise.all([
      this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.admin', 'admin')
        .orderBy('notification.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.notificationRepository
        .createQueryBuilder('notification') // Alias for the table
        .leftJoin('notification.admin', 'admin') // Join the related vendor table
        .getCount(), // Count total records for pagination

      this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoin('notification.admin', 'admin')
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

  async markAllAsRead(adminID: string) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(AdminNotification)
      .set({ is_read: true })
      .where('admin.id = :adminID AND is_read = false', { adminID })
      .execute();

    return { message: '' };
  }

  async setWalletPin(email_address: string, payload: UpdateWalletPINDTO) {
    if (!payload?.vendor_id) {
      throw new HttpException('Vendor ID is required', HttpStatus.BAD_REQUEST);
    }

    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    if (
      admin.role !== AdminRoles.SUPER_ADMIN &&
      admin.access !== AdminAccess.READ_WRITE
    ) {
      throw new HttpException('You are forbidden!', HttpStatus.FORBIDDEN);
    }

    // Now find wallett
    const wallet = await this.walletRepository.find();

    if (!wallet || wallet?.length < 1) {
      throw new HttpException('Admin wallet not found', HttpStatus.NOT_FOUND);
    }

    if (admin?.wallet_pin) {
      // It has been addded before, so compare with new pin before updting
      if (!payload?.old_pin) {
        throw new HttpException(
          'old wallet pin is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const savedPin = admin?.wallet_pin;
      if (admin && !bcrypt.compareSync(payload?.old_pin, savedPin)) {
        throw new HttpException(
          'Incorrect wallet pin entered',
          HttpStatus.BAD_REQUEST,
        );
      } else if (admin && bcrypt.compareSync(payload?.old_pin, savedPin)) {
        // All good
        // Noow encodde new pin
        const encodedPassword = await encodePassword(payload.new_pin);
        admin.wallet_pin = encodedPassword;
        admin.updated_at = new Date();

        await this.adminRepository.save(admin);
        return {
          message: 'Wallet pin updated successfully',
        };
      }
    } else {
      // Create new pin
      const encodedPassword = await encodePassword(payload.new_pin);
      admin.wallet_pin = encodedPassword;
      admin.updated_at = new Date();

      await this.adminRepository.save(admin);
      return {
        message: 'Wallet pin set successfully',
      };
    }
  }

  async findAdminWallet() {
    // Retrieve the wallet belonging to the vendor
    const wallet = await this.walletRepository.find();

    if (!wallet || wallet?.length < 1) {
      // No wallet ccreated. Now create one here
      const newWallet = this.walletRepository.create({
        balance: 0,
        prev_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const createdWallet = await this.walletRepository.save(newWallet);
      return createdWallet;
    }

    return wallet[0];
  }
}
