import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/entities/operator.entity';
import { encodePassword } from 'src/utils/bcrypt';
import { Repository } from 'typeorm';
import { CreateOperatorDTO } from './dtos/createoperator.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnboardingEmailContent } from 'src/utils/email';
import { OperatorRole, OperatorType } from 'src/enums/operator.type.enum';
import { UserType } from 'src/enums/user.type.enum';
import { UpdateOperatorDTO } from './dtos/updateoperator.dto';
import { Vendor } from 'src/entities/vendor.entity';
import { UserStatus } from 'src/enums/user.status.enum';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { UpdateFCMTokenDTO } from 'src/commons/dtos/update.fcm.dto';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLocation)
    private vendorLocationRepository: Repository<VendorLocation>,
    private mailerService: MailerService,
  ) {}

  findOperators() {
    return this.operatorRepository.find();
  }

  async findOperatorsPaged(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.operatorRepository
        .createQueryBuilder('operator') // Alias for the Admin table
        .leftJoinAndSelect('operator.vendor_location', 'vendor_location') // Join the related product table
        .leftJoinAndSelect('operator.vendor', 'vendor') // Join the related product tablev
        .where('operator.status != :status', { status: UserStatus.DELETED })
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.operatorRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createOperator(
    email_address: string,
    createOperatorDto: CreateOperatorDTO,
  ) {
    const opr = await this.operatorRepository.findOne({
      where: {
        email_address: email_address,
        operator_type: OperatorType.OWNER,
      },
      relations: ['vendor'],
    });

    if (!opr) {
      throw new HttpException(
        { message: 'Owner record not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!opr.identity_type || !opr.identity_number || !opr.vendor) {
      throw new HttpException(
        {
          message: 'You must first complete your KYC',
          error: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundOperator = await this.operatorRepository.findOne({
      where: {
        email_address: createOperatorDto.email_address,
      },
      relations: ['vendor'],
    });

    if (foundOperator) {
      throw new HttpException(
        {
          message: 'Email address already taken',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundPhone = await this.operatorRepository.findOne({
      where: {
        phone_number: createOperatorDto.phone_number,
      },
      relations: ['vendor'],
    });

    if (foundPhone) {
      throw new HttpException(
        {
          message: 'Phone number already taken',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: opr?.vendor?.id },
    });

    if (!vendor) {
      throw new HttpException(
        { message: 'Vendor record not found', error: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (createOperatorDto.vendor_location) {
      const vendorLocation = await this.vendorLocationRepository.findOne({
        where: { id: createOperatorDto.vendor_location },
      });

      if (!vendorLocation) {
        throw new HttpException(
          { message: 'Vendor record not found', error: HttpStatus.NOT_FOUND },
          HttpStatus.NOT_FOUND,
        );
      }

      const generatedPassword = generateRandomPassword();
      const encodedPassword = await encodePassword(generatedPassword);
      const newUser = this.operatorRepository.create({
        city: createOperatorDto?.city,
        country: 'Nigeria',
        country_code: createOperatorDto?.country_code,
        email_address: createOperatorDto?.email_address,
        first_name: createOperatorDto?.first_name,
        intl_phone_format: createOperatorDto?.intl_phone_format,
        iso_code: createOperatorDto?.iso_code,
        operator_type: createOperatorDto?.operator_type,
        operator_role: createOperatorDto?.operator_role,
        last_name: createOperatorDto?.last_name,
        phone_number: createOperatorDto?.phone_number,
        state: createOperatorDto?.state,
        street: createOperatorDto?.street,
        user_type: UserType?.OPERATOR,
        password: encodedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newUser.vendor = vendor;
      newUser.vendor_location = vendorLocation;
      const saveduser = this.operatorRepository.save(newUser);

      // Now send this passwordd to operator's email address
      await this.mailerService.sendMail({
        to: createOperatorDto?.email_address,
        subject: 'New Operator Onboarding',
        html: userOnboardingEmailContent(
          {
            email_address: createOperatorDto.email_address,
            type: UserType.OPERATOR,
            password: generatedPassword,
            vendor: vendor,
            operator_type: createOperatorDto.operator_type,
          },
          createOperatorDto?.first_name,
        ),
      });

      return {
        message: 'User added successfully',
        data: saveduser,
      };
    } else {
      const generatedPassword = generateRandomPassword();
      const encodedPassword = await encodePassword(generatedPassword);
      const newUser = this.operatorRepository.create({
        city: createOperatorDto?.city,
        country: 'Nigeria',
        country_code: createOperatorDto?.country_code,
        email_address: createOperatorDto?.email_address,
        first_name: createOperatorDto?.first_name,
        intl_phone_format: createOperatorDto?.intl_phone_format,
        iso_code: createOperatorDto?.iso_code,
        operator_type: createOperatorDto?.operator_type,
        operator_role: createOperatorDto?.operator_role,
        last_name: createOperatorDto?.last_name,
        phone_number: createOperatorDto?.phone_number,
        state: createOperatorDto?.state,
        street: createOperatorDto?.street,
        user_type: UserType?.OPERATOR,
        password: encodedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newUser.vendor = vendor;
      const saveduser = this.operatorRepository.save(newUser);

      // Now send this passwordd to operator's email address
      await this.mailerService.sendMail({
        to: createOperatorDto?.email_address,
        subject: 'New Operator Onboarding',
        html: userOnboardingEmailContent(
          {
            email_address: createOperatorDto.email_address,
            type: UserType.OPERATOR,
            password: generatedPassword,
            vendor: vendor,
            operator_type: createOperatorDto.operator_type,
          },
          createOperatorDto?.first_name,
        ),
      });

      return {
        message: 'User added successfully',
        data: saveduser,
      };
    }
  }

  async findOperatorByUsername(email_address: string): Promise<Operator> {
    const foundUser = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    console.log('FOUND OPERATOR USR :: ', foundUser);

    return foundUser;
  }

  async findOperatorByPhone(phone_number: string): Promise<Operator> {
    const foundUser = await this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.vendor_location', 'vendor_location')
      .leftJoinAndSelect('operator.vendor', 'vendor')
      .where('operator.phone_number = :phone_number', { phone_number })
      .getOne();

    return foundUser || null;
  }

  async findCurrentOperator(email_address: string) {
    const admin = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor', 'vendor_location'], // Include the 'vendor' relation
    });

    const { password, ...rest } = admin;
    console.log(password);
    return rest;
  }

  findOperatorById(id: string) {
    return this.operatorRepository.findOne({
      where: { id: id },
      relations: ['vendor', 'vendor_location'],
    });
  }

  async findBranchOperators(branchId: string, page: number, limit: number) {
    // First find this vendor first
    const vendorLocation = await this.vendorLocationRepository.findOne({
      where: { id: branchId },
    });

    if (!vendorLocation) {
      throw new HttpException(
        {
          message: 'Vendor location record not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.operatorRepository
        .createQueryBuilder('operator') // Alias for the table
        .leftJoinAndSelect('operator.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('operator.vendor_location', 'vendor_location') // Join the related product table
        .where('vendor_location.id = :branchId', { branchId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.operatorRepository
        .createQueryBuilder('operator') // Alias for the table
        .leftJoin('operator.vendor', 'vendor') // Join the related vendor table
        .leftJoinAndSelect('operator.vendor_location', 'vendor_location')
        .where('vendor_location.id = :branchId', { branchId }) // Filter by vendor ID
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

  async updateOperator(email: string, payload: UpdateOperatorDTO) {
    try {
      const user = await this.operatorRepository.findOne({
        where: { email_address: email },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      await this.operatorRepository.update(
        { email_address: email },
        { ...payload },
      );

      const profile = this.operatorRepository.create({
        ...user,
        ...payload,
      });

      const updatedUser = await this.operatorRepository.save(profile);

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

  async updateFCMToken(email_address: string, payload: UpdateFCMTokenDTO) {
    const user = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });
    if (!user)
      throw new HttpException('Customer not found.', HttpStatus.NOT_FOUND);

    user.fcmToken = payload?.token ?? user.fcmToken;
    const updatedUser = await this.operatorRepository.save(user);

    const { password, ...others } = updatedUser;
    console.log('REMOVED PASWORD ::: ', password);

    return {
      message: 'FCM token updated successfully',
      user: others,
    };
  }

  async updateOperatorById(id: string, payload: UpdateOperatorDTO) {
    try {
      const user = await this.operatorRepository.findOne({
        where: { id: id },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      await this.operatorRepository.update(
        { email_address: id },
        { ...payload },
      );

      const profile = this.operatorRepository.create({
        ...user,
        ...payload,
      });

      const updatedUser = await this.operatorRepository.save(profile);

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

  async suspendStaff(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const operator = await this.operatorRepository.findOne({
        where: { email_address: email_address },
      });
      if (!operator) {
        throw new HttpException('No operator found.', HttpStatus.NOT_FOUND);
      }

      if (
        operator.operator_type !== OperatorType.OWNER &&
        operator.operator_role !== OperatorRole.MANAGER &&
        operator.operator_role !== OperatorRole.SUPERVISOR
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: 'You are forbidden to perform this action',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const foundStaff = await this.operatorRepository.findOne({
        where: { id: id },
      });
      if (!foundStaff) {
        throw new HttpException(
          'Staff record not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.operatorRepository.update(
        { id: foundStaff?.id }, // Update condition
        { status: UserStatus.SUSPENDED, updated_at: new Date() }, // New values to set
      );

      return {
        message: 'Staff suspended successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async pardonStaff(email_address: string, id: string) {
    try {
      const operator = await this.operatorRepository.findOne({
        where: { email_address: email_address },
      });
      if (!operator) {
        throw new HttpException('No operator found.', HttpStatus.NOT_FOUND);
      }

      if (
        operator.operator_type !== OperatorType.OWNER &&
        operator.operator_role !== OperatorRole.MANAGER &&
        operator.operator_role !== OperatorRole.SUPERVISOR
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: 'You are forbidden to perform this action',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const foundStaff = await this.operatorRepository.findOne({
        where: { id: id },
      });
      if (!foundStaff) {
        throw new HttpException(
          'Staff record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.operatorRepository.update(
        { id: id },
        { status: UserStatus.ACTIVE, updated_at: new Date() },
      );

      return {
        message: 'Staff account restored successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteStaff(email_address: string, id: string) {
    try {
      const operator = await this.operatorRepository.findOne({
        where: { email_address: email_address },
      });
      if (!operator) {
        throw new HttpException('No operator found.', HttpStatus.NOT_FOUND);
      }

      if (operator.operator_type !== OperatorType.OWNER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: 'You are forbidden to perform this action',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const foundStaff = await this.operatorRepository.findOne({
        where: { id: id },
      });
      if (!foundStaff) {
        throw new HttpException(
          'Staff record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.operatorRepository.delete({ id: id });

      return {
        message: 'Staff account deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
