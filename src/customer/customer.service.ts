import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { encodePassword } from 'src/utils/bcrypt';
import { Repository } from 'typeorm';
import {
  RegisterCustomerDTO,
  CreateCustomerGoogleDTO,
} from './dtos/registercustomer.dto';
import { UserStatus } from 'src/enums/user.status.enum';
import { CreateCustomerDTO } from './dtos/createcustomer.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnboardingEmailContent } from 'src/utils/email';
import { Admin } from 'src/entities/admin.entity';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { Cart } from 'src/entities/cart.entity';
import { AddToCartDTO } from './dtos/addtocart.dto';
import { Product } from 'src/entities/product.entity';
import { UpdateCartDTO } from './dtos/updatecart.dto';
import { UserType } from 'src/enums/user.type.enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private mailerService: MailerService,
  ) {}

  findUsers() {
    return this.customerRepository.find();
  }

  async findCustomers(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.customerRepository
        .createQueryBuilder('customer') // Alias for the Admin table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.customerRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createCustomer(registerCustomerDto: RegisterCustomerDTO) {
    const encodedPassword = await encodePassword(registerCustomerDto.password);
    const newUser = this.customerRepository.create({
      ...registerCustomerDto,
      account_type: 'regular',
      password: encodedPassword,
      is_profile_set: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.customerRepository.save(newUser);
    return newUser;
  }

  async createCustomerGoogle(createUserGoogleDto: CreateCustomerGoogleDTO) {
    const newUser = this.customerRepository.create({
      ...createUserGoogleDto,
      first_name: createUserGoogleDto.first_name,
      last_name: createUserGoogleDto.last_name,
      is_email_verified: true,
      is_profile_set: false,
      next_login: new Date(),
      last_login: new Date(),
      account_type: 'google',
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.customerRepository.save(newUser);
    return newUser;
  }

  async addCustomer(
    email_address: string,
    createCustomerDTO: CreateCustomerDTO,
  ) {
    const adm = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!adm) {
      throw new HttpException(
        { message: 'Administrator not found', error: HttpStatus.BAD_REQUEST },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      adm.access !== AdminAccess.READ_WRITE &&
      adm.role === AdminRoles.SUPPORT
    ) {
      throw new HttpException(
        {
          message: "You don't have required privileges",
          error: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const generatedPassword = generateRandomPassword();
    const encodedPassword = await encodePassword(generatedPassword);
    const newCustomer = this.customerRepository.create({
      ...createCustomerDTO,
      password: encodedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.customerRepository.save(newCustomer);

    // Now send this passwordd to admin's email address
    await this.mailerService.sendMail({
      to: createCustomerDTO?.email_address,
      subject: 'New Customer Onboarding',
      html: userOnboardingEmailContent(
        {
          email_address: createCustomerDTO.email_address,
          type: UserType.CUSTOMER,
          password: generatedPassword,
        },
        `${createCustomerDTO?.first_name} ${createCustomerDTO?.last_name}`,
      ),
    });

    return newCustomer;
  }

  async findCustomerByUsername(email_address: string): Promise<Customer> {
    const foundUser = await this.customerRepository.findOne({
      where: { email_address: email_address },
    });

    console.log('FOUND USER :: ', foundUser);

    return foundUser;
  }

  async findCustomerByPhone(phone_number: string): Promise<Customer> {
    const foundUser = await this.customerRepository.findOne({
      where: { phone_number: phone_number },
    });

    console.log('FOUND USER :: ', foundUser);

    return foundUser;
  }

  findCustomerById(id: string) {
    return this.customerRepository.findOne({ where: { id: id } });
  }

  async updateCustomer(id: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    try {
      if (!payload) {
        throw new HttpException(
          'Payload not provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.customerRepository.findOne({
        where: { email_address: id },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      // if (payload?.address) {
      //   // const newAddress = this.addressRepository.create({
      //   //   city: payload?.address?.city,
      //   //   state: payload?.address?.state,
      //   //   country: payload?.address?.country,
      //   //   street: payload?.address?.street,
      //   //   created_at: new Date(),
      //   //   updated_at: new Date(),
      //   // });
      //   // const savedAddress = await this.addressRepository.save(newAddress);
      //   // user.address = savedAddress;
      //   // await this.createUserAddress(id, payload?.address);
      // }

      // const { address, ...rest } = payload;
      // console.log('DISCARDED ADDRESS PART  ::: ', address);

      await this.customerRepository.update(
        { email_address: id },
        { ...payload },
      );
      const updatedUser = await this.customerRepository.findOne({
        where: { email_address: id },
      });

      //   await this.historyService.saveHistory({
      //     status: 'success',
      //     title: `You updated your profile on ${new Date().toLocaleString('en-GB')}`,
      //     type: 'profile',
      //     email_address: user?.email_address,
      //   });

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

  async deleteCustomer(id: string) {
    const admin = await this.customerRepository.findOne({
      where: { email_address: id },
    });
    if (!admin)
      throw new HttpException('No customer found.', HttpStatus.NOT_FOUND);

    await this.customerRepository.update(
      { email_address: id },
      { status: UserStatus.DELETED },
    );

    return {
      message: 'Customer deleted successfully',
      data: null,
    };
  }

  async addItemToCart(payload: AddToCartDTO) {
    // First check if user is valid
    const customer = await this.customerRepository.findOne({
      where: { id: payload?.customerId },
    });

    if (!customer) {
      throw new HttpException(
        {
          message: 'Customer not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const product = await this.productRepository.findOne({
      where: { id: payload?.productId },
    });

    if (!product) {
      throw new HttpException(
        {
          message: 'Product not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const cart = this.cartRepository.create({
      amount: payload?.amount,
      quantity: payload.quantity,
      created_at: new Date(),
      updated_at: new Date(),
    });

    cart.customer = customer;
    cart.product = product;

    const savedCart = await this.cartRepository.save(cart);

    return {
      message: 'Added to cart successfully',
      data: savedCart,
    };
  }

  async allCarts(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.cartRepository
        .createQueryBuilder('cart') // Alias for the Admin table
        .leftJoinAndSelect('cart.product', 'product') //
        .leftJoinAndSelect('cart.customer', 'customer') //
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.cartRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async customerCarts(page: number, limit: number, customerId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new HttpException(
        {
          message: 'Customer not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.cartRepository
        .createQueryBuilder('cart') // Alias for the table
        .leftJoinAndSelect('cart.customer', 'customer') // Join the related product table
        .leftJoinAndSelect('cart.product', 'product') // Join the related product table
        .where('customer.id = :customerId', { customerId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.cartRepository
        .createQueryBuilder('cart') // Alias for the table
        .leftJoin('cart.customer', 'customer') // Join the related vendor table
        .leftJoin('cart.product', 'product') // Join the related vendor table
        .where('customer.id = :customerId', { customerId }) // Filter by vendor ID
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

  async updateCart(cartId: string, payload: UpdateCartDTO) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new HttpException(
        {
          message: 'Cart item not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    cart.amount = payload?.amount;
    cart.quantity = payload?.quantity;
    cart.updated_at = new Date();

    const updatedCart = await this.cartRepository.save(cart);

    return {
      message: 'Updated to cart successfully',
      data: updatedCart,
    };
  }

  async deleteCart(cartId: string) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new HttpException(
        {
          message: 'Cart item not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.cartRepository.delete({ id: cartId });

    return {
      message: 'Cart item deleted successfully',
    };
  }
}
