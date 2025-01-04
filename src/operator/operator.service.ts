import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/entities/operator.entity';
import { encodePassword } from 'src/utils/bcrypt';
import { Repository } from 'typeorm';
import { CreateOperatorDTO } from './dtos/createoperator.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnboardingEmailContent } from 'src/utils/email';
import { OperatorType } from 'src/enums/operator.type.enum';
import { UserType } from 'src/enums/user.type.enum';
import { UpdateOperatorDTO } from './dtos/updateoperator.dto';
import { Vendor } from 'src/entities/vendor.entity';
import { UserStatus } from 'src/enums/user.status.enum';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
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
        .leftJoinAndSelect('operator.vendor', 'vendor') // Join the related product table
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
      last_name: createOperatorDto?.last_name,
      phone_number: createOperatorDto?.phone_number,
      permissions: createOperatorDto?.permissions,
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

  async findOperatorByUsername(email_address: string): Promise<Operator> {
    const foundUser = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });

    console.log('FOUND USER :: ', foundUser);

    return foundUser;
  }

  async findCurrentOperator(email_address: string) {
    const admin = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'], // Include the 'vendor' relation
    });

    const { password, ...rest } = admin;
    console.log(password);
    return rest;
  }

  findOperatorById(id: string) {
    return this.operatorRepository.findOne({ where: { id: id } });
  }

  async updateOperator(id: string, payload: UpdateOperatorDTO) {
    try {
      const user = await this.operatorRepository.findOne({
        where: { email_address: id },
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
}
