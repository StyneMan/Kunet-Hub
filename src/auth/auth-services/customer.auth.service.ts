/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from 'src/customer/customer.service';
import {
  RegisterCustomerDTO,
  CreateCustomerGoogleDTO,
} from 'src/customer/dtos/registercustomer.dto';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import { generateOTP } from 'src/utils/otp_generator';
import { MailerService } from '@nestjs-modules/mailer';
import {
  passwordEmailContent,
  verificationEmailContent,
} from 'src/utils/email';
import { OTPPayloadDto } from 'src/otp/dto/otp.dto';
import { LoginCustomerDTO } from 'src/customer/dtos/logincustomer.dto';
import { CustomerOTP } from 'src/entities/otp.customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SendOTPDTO } from 'src/commons/dtos/sendotp.dto';
import { UserStatus } from 'src/enums/user.status.enum';
import { VerifyOTPDTO } from 'src/commons/dtos/verifyotp.dto';
import { OTPType } from 'src/enums/otp.type.enum';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly mailerService: MailerService,
    @InjectRepository(CustomerOTP)
    private readonly otpRepository: Repository<CustomerOTP>,
    private jwtService: JwtService,
  ) {}

  async validateCustomer(username: string, password: string) {
    const userDB = await this.customerService.findCustomerByUsername(username);

    if (userDB && userDB.password === password) {
      const matched = comparePasswords(password, userDB.password);
      if (matched) {
        console.log('USER DATA :: ', userDB);
        const { password, ...usr } = userDB;
        console.log(password);
        const payload = {
          sub: userDB?.email_address,
          username: userDB?.first_name,
        };
        return {
          accessToken: await this.jwtService.signAsync(payload),
          user: usr,
        };
      } else {
        console.log('No matching password was found!!!');
        return null;
      }
    }
    return null;
  }

  async validateUserGoogle(createCustomerDto: CreateCustomerGoogleDTO) {
    console.log('AuthService');
    const user = await this.customerService.findCustomerByUsername(
      createCustomerDto?.email_address,
    );
    console.log(user);
    if (user) {
      // Sign JWT here using user credentials
      return user;
    }
    console.log('User not found. Creating...');
    const newUser =
      await this.customerService.createCustomerGoogle(createCustomerDto);

    return newUser;
  }

  async validateCreateUser(userData: RegisterCustomerDTO) {
    try {
      console.log('User Payload from Client :: ', userData);
      if (!userData) {
        throw new HttpException(
          'Payload not provided !!!',
          HttpStatus.FORBIDDEN,
        );
      }
      const userDB = await this.customerService.findCustomerByUsername(
        userData?.email_address,
      );

      if (userDB) {
        return {
          message: 'Account already exist',
        };
      }

      const customerPhone = await this.customerService.findCustomerByPhone(
        userData?.phone_number,
      );

      if (customerPhone) {
        throw new HttpException(
          {
            message: 'Phone number is taken',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const createdUsr = await this.customerService.createCustomer(userData);
      console.log('CREATED USER ', createdUsr);

      // Send OTP Code here
      const otpCode = generateOTP();
      const emailSent = await this.mailerService.sendMail({
        to: userData?.email_address,
        subject: 'New Account Creation',
        html: verificationEmailContent(
          otpCode,
          `${userData?.first_name} ${userData?.last_name}`,
        ),
      });

      // Save/Update OTP code for user here
      const currentUserOTP = await this.otpRepository.findOne({
        where: { user: createdUsr },
      });
      if (currentUserOTP) {
        // OTP Already exists for this user so update it here
        await this.otpRepository.update(
          { user: createdUsr },
          {
            code: otpCode,
            expired: false,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
            updated_at: new Date(),
          },
        );
      } else {
        // No OTP so add new
        const newOTP = this.otpRepository.create({
          code: otpCode,
          user: userData,
          expired: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.otpRepository.save(newOTP);
      }

      if (emailSent) {
        return {
          message: 'Email sent successfully',
        };
      } else {
        return {
          message: 'Failed to send OTP email',
        };
      }
    } catch (error) {
      console.log('ERR :: EMAIL ', error);
    }
  }

  async sendOTP(payload: SendOTPDTO) {
    try {
      console.log('User Payload from Client :: ', payload?.email_address);
      if (!payload) {
        throw new HttpException(
          {
            message: 'Payload not provided !!!',
            status: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const userData = await this.customerService.findCustomerByUsername(
        payload?.email_address,
      );
      if (!userData) {
        throw new HttpException(
          {
            message: 'User email is not registered on this platform!',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      console.log('LJSK::: ', userData);

      // Send OTP Code here
      const otpCode = generateOTP();
      console.log(otpCode);

      const emailSent = await this.mailerService.sendMail({
        to: payload?.email_address,
        subject: 'New OTP Sent',
        html: verificationEmailContent(otpCode, userData?.first_name),
      });

      const currentUserOTP = await this.otpRepository.findOne({
        where: { user: userData },
      });
      if (currentUserOTP) {
        // OTP Already exists for this user so update it here
        await this.otpRepository.update(
          { user: userData },
          {
            code: otpCode,
            expired: false,
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
            updated_at: new Date(),
          },
        );
      } else {
        // No OTP so add new
        const newOTP = this.otpRepository.create({
          code: otpCode,
          user: userData,
          expired: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.otpRepository.save(newOTP);
      }

      if (emailSent) {
        return {
          message: 'OTP email sent successfully',
        };
      } else {
        return {
          message: 'Failed to send OTP email',
        };
      }
    } catch (error) {
      console.log('ERR :: EMAIL ', error);
    }
  }

  async validateVerifyOTP(otpPayload: VerifyOTPDTO) {
    console.log('User Payload from Client :: ', otpPayload);
    if (
      otpPayload?.code === undefined ||
      otpPayload?.email_address === undefined
    ) {
      throw new HttpException(
        {
          message: 'Payload not provided !!!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const userDb = await this.customerService.findCustomerByUsername(
      otpPayload?.email_address,
    );
    if (!userDb) {
      throw new HttpException(
        {
          message: 'User record not found',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const otpDb = await this.otpRepository.findOne({
      where: { user: userDb },
    });

    if (!otpDb) {
      throw new HttpException(
        {
          message: 'OTP data not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now compare this otp code and the one saved to the database
    if (otpDb?.code !== otpPayload.code) {
      throw new HttpException(
        {
          message: 'OTP code not valid',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (otpDb.expired || new Date() > otpDb.expires_at) {
      // Mark OTP as expired in the database for consistency
      otpDb.expired = true;
      await this.otpRepository.save(otpDb);

      throw new HttpException(
        {
          message: 'OTP code has expired',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // await this.otpService.removeOtp(otpDb?.id);
    await this.otpRepository.delete({ id: otpDb?.id });
    // Now set user's email_verified to true
    await this.customerService.updateCustomer(userDb?.email_address, {
      is_email_verified: true,
      status: UserStatus.ACTIVE,
      last_login: new Date(),
      next_login: new Date(),
    });

    const usere = await this.customerService.findCustomerByUsername(
      otpPayload?.email_address,
    );

    if (
      otpPayload.use_case &&
      otpPayload.use_case === OTPType.ACCOUNT_VERIFICATION
    ) {
      const { password, ...usr } = usere;
      const payload = {
        sub: userDb?.email_address,
        username: userDb?.first_name,
      };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        message: 'Account verified successfully',
        user: usr,
      };
    }

    // const { password, ...usr } = usere;
    // const payload = {
    //   sub: userDb?.email_address,
    //   username: userDb?.first_name,
    // };

    return {
      message: 'OTP verified successfully',
    };
  }

  //   async validateGoogleAuth(createUserDto: CreateCustomerGoogleDTO) {
  //     try {
  //       const user = await this.customerService.findCustomerByUsername(
  //         createUserDto?.email_address,
  //       );
  //       console.log(user);
  //       if (user) {
  //         // update last_login here
  //         await this.userRepository.update(
  //           { id: user?.id },
  //           {
  //             next_login: new Date(),
  //             last_login: user?.next_login ?? new Date(),
  //           },
  //         );

  //         await this.historyService.saveHistory({
  //           status: 'success',
  //           title: 'You logged into your Afrikunet account via google',
  //           type: 'login',
  //           email_address: createUserDto?.email_address,
  //         });

  //         const usere = await this.customerService.findUserById(user?.id);

  //         // const { password, ...result } = usere;
  //         const { password, ...usr } = usere;
  //         const payload = {
  //           sub: user?.email_address,
  //           username: user?.first_name,
  //         };

  //         return {
  //           accessToken: await this.jwtService.signAsync(payload),
  //           message: 'Logged in successfully',
  //           user: usr,
  //         };
  //       } else {
  //         console.log('User not found. Creating...');
  //         const newUser =
  //           await this.customerService.createUserGoogle(createUserDto);

  //         await this.historyService.saveHistory({
  //           status: 'success',
  //           title: 'You created a new Afrikunet account via google',
  //           type: 'register',
  //           email_address: createUserDto?.email_address,
  //         });

  //         const { password, ...usr } = newUser;
  //         const payload = {
  //           sub: createUserDto?.email_address,
  //           username: user?.first_name,
  //         };

  //         return {
  //           accessToken: await this.jwtService.signAsync(payload),
  //           message: 'Account created successfully',
  //           user: usr,
  //         };
  //       }
  //     } catch (error) {
  //       console.log('eror : ', error);
  //       throw error;
  //     }
  //   }

  async validateLogin(loginUserDTO: LoginCustomerDTO) {
    console.log('User Payload from Client :: ', loginUserDTO);
    if (!loginUserDTO) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const userDB = await this.customerService.findCustomerByUsername(
      loginUserDTO?.email_address,
    );
    console.log(userDB);

    if (!userDB) {
      throw new HttpException(
        {
          message: 'Account does not exist on our platform!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userDB?.status === UserStatus.DELETED) {
      throw new HttpException(
        {
          message: 'Account does not exist on our platform!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userDB?.status === UserStatus.SUSPENDED) {
      throw new HttpException(
        {
          message: 'Account currently on hold',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Now compare passwords before login
    if (
      userDB &&
      (await bcrypt.compareSync(loginUserDTO.password, userDB?.password))
    ) {
      if (!userDB?.is_email_verified) {
        return await this.sendOTP({ email_address: userDB.email_address });
      }
      // update last_login here
      await this.customerService.updateCustomer(userDB?.email_address, {
        next_login: new Date(),
        last_login: userDB?.next_login ?? new Date(),
      });

      const usere = await this.customerService.findCustomerById(userDB?.id);

      const { password, ...usr } = usere;
      const payload = {
        sub: userDB?.email_address,
        username: userDB?.first_name,
      };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        message: 'Logged in successfully',
        user: usr,
      };
    } else {
      throw new HttpException(
        'Credentials do not match',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendPasswordResetEmail(email_address: string) {
    console.log('User Payload from Client :: ', email_address);
    if (!email_address) {
      throw new HttpException(
        'Email address not provided !!!',
        HttpStatus.FORBIDDEN,
      );
    }
    const userData =
      await this.customerService.findCustomerByUsername(email_address);

    if (!userData) {
      throw new HttpException(
        'User email is not registered on this platform!',
        HttpStatus.NOT_FOUND,
      );
    }
    // Send OTP Code here
    const otpCode = generateOTP();
    const emailSent = await this.mailerService.sendMail({
      to: email_address,
      subject: 'Account Password Reset OTP',
      html: passwordEmailContent(otpCode, userData?.first_name),
    });

    // Save/Update OTP code for user here
    const currentUserOTP = await this.otpRepository.findOne({
      where: { user: userData },
    });
    if (currentUserOTP) {
      // OTP Already exists for this user so update it here
      await this.otpRepository.update(
        { user: userData },
        {
          code: otpCode,
          expired: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          updated_at: new Date(),
        },
      );
    } else {
      const newOTP = this.otpRepository.create({
        code: otpCode,
        user: userData,
        expired: false,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      });
      await this.otpRepository.save(newOTP);
    }

    if (emailSent) {
      return {
        message: 'OTP code sent to email successfully',
      };
    } else {
      return {
        message: 'Failed to send OTP email',
      };
    }
  }

  async resetPassword(
    new_password: string,
    confirm_password: string,
    email_address: string,
  ) {
    if (new_password !== confirm_password) {
      throw new HttpException(
        {
          message: 'Passwords do not match',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const userData =
      await this.customerService.findCustomerByUsername(email_address);

    if (!userData) {
      throw new HttpException(
        {
          message: 'User is not registered on this platform!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now hash the current password and update
    const hashed = await encodePassword(new_password);
    await this.customerService.updateCustomer(userData?.email_address, {
      password: hashed,
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
