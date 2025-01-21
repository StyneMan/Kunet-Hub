import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { AddToCartDTO, CartItemDTO } from './dtos/addtocart.dto';
import { Product } from 'src/entities/product.entity';
import { UpdateCartDTO } from './dtos/updatecart.dto';
import { UserType } from 'src/enums/user.type.enum';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { ShippingAddress } from 'src/entities/shipping.address.entity';
import { AddShippingAddressDTO } from './dtos/add.shipping.address.dto';
import { UpdateShippingAddressDTO } from './dtos/update.shipping.address.dto';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { CustomerFavourites } from 'src/entities/customer.favourites.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { VendorType } from 'src/enums/vendor.type.enum';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { CartItem } from 'src/entities/cart.item.entity';
import { ProductStatus } from 'src/enums/product.status.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
// import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(AdminActivity)
    private readonly activitiesRepository: Repository<AdminActivity>,
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
    @InjectRepository(CustomerWallet)
    private readonly walletRepository: Repository<CustomerWallet>,
    @InjectRepository(CustomerFavourites)
    private readonly customerFavsRepository: Repository<CustomerFavourites>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private mailerService: MailerService,
    private socketGateway: SocketGateway,
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
    // First check if customer already exist
    const customerFound = await this.customerRepository.findOne({
      where: { email_address: registerCustomerDto?.email_address },
    });
    if (customerFound) {
      throw new HttpException(
        {
          message: 'Email address already taken!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // First check if phone exist
    const customerPhone = await this.customerRepository.findOne({
      where: { phone_number: registerCustomerDto?.phone_number },
    });
    if (customerPhone) {
      throw new HttpException(
        {
          message: 'Phone number already taken!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const encodedPassword = await encodePassword(registerCustomerDto.password);
    const newUser = this.customerRepository.create({
      ...registerCustomerDto,
      account_type: 'regular',
      password: encodedPassword,
      is_profile_set: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.customerRepository.save(newUser);

    // Now create wallet as well
    const wallet = this.walletRepository.create({
      balance: 0.0,
      prev_balance: 0.0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    wallet.customer = newUser;
    await this.walletRepository.save(wallet);

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
      adm.role !== AdminRoles.SUPER_ADMIN &&
      adm.role != AdminRoles.MANAGER
    ) {
      throw new HttpException(
        {
          message: "You don't have required privileges",
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // First check if rider already exist
    const customerFound = await this.customerRepository.findOne({
      where: { email_address: createCustomerDTO?.email_address },
    });
    if (customerFound) {
      throw new HttpException(
        {
          message: 'Email address already taken!',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // First check if zone exist
    const customerPhone = await this.customerRepository.findOne({
      where: { phone_number: createCustomerDTO?.phone_number },
    });
    if (customerPhone) {
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
    const newCustomer = this.customerRepository.create({
      ...createCustomerDTO,
      password: encodedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.customerRepository.save(newCustomer);

    // Now create wallet as well
    const wallet = this.walletRepository.create({
      balance: 0.0,
      prev_balance: 0.0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    wallet.customer = newCustomer;
    await this.walletRepository.save(wallet);

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

  async findCurrentCustomer(email_address: string) {
    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
    });

    if (!customer) {
      return null;
    }

    const { password, ...rest } = customer;
    console.log(password);

    return rest;
  }

  findCustomerById(id: string) {
    return this.customerRepository.findOne({ where: { id: id } });
  }

  async updateCustomer(email_address: string, payload: any) {
    try {
      if (!payload) {
        throw new HttpException(
          'Payload not provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.customerRepository.findOne({
        where: { email_address: email_address },
      });
      if (!user)
        throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

      await this.customerRepository.update(
        { email_address: email_address },
        { ...payload },
      );
      const updatedUser = await this.customerRepository.findOne({
        where: { email_address: email_address },
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

  async suspendCustomer(email_address: string, id: string) {
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

      const foundCustomer = await this.customerRepository.findOne({
        where: { id: id },
      });
      if (!foundCustomer) {
        throw new HttpException(
          'Customer record not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.customerRepository.update(
        { id: foundCustomer?.id }, // Update condition
        { status: UserStatus.SUSPENDED, updated_at: new Date() }, // New values to set
      );

      const activity = this.activitiesRepository.create({
        name: 'Customer Account Suspension',
        description: `${adm?.first_name} ${adm?.last_name} suspended customer account (${foundCustomer?.first_name} ${foundCustomer?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
      activity.user = adm;
      this.activitiesRepository.save(activity);

      return {
        message: 'Customer account suspended successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async pardonCustomer(email_address: string, id: string) {
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

      const foundCustomer = await this.customerRepository.findOne({
        where: { id: id },
      });
      if (!foundCustomer) {
        throw new HttpException(
          'Customer record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.customerRepository.update(
        { id: id },
        { status: UserStatus.ACTIVE, updated_at: new Date() },
      );

      const activity = this.activitiesRepository.create({
        name: 'Customer Account Pardoned',
        description: `${adm?.first_name} ${adm?.last_name} pardoned customer account (${foundCustomer?.first_name} ${foundCustomer?.last_name})}`,
        created_at: new Date(),
        updated_at: new Date(),
      });

      activity.user = adm;
      await this.activitiesRepository.save(activity);

      return {
        message: 'Customer account pardoned successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCustomer(id: string) {
    const customer = await this.customerRepository.findOne({
      where: { email_address: id },
    });
    if (!customer)
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

  async addCartItem(email_address: string, payload: CartItemDTO) {
    // First check if user is valid
    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
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
      where: { id: payload?.product_id },
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

    if (product.status !== ProductStatus.ACTIVE) {
      throw new HttpException(
        {
          message: 'Product not active',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const cartItem = this.cartItemRepository.create({
      amount: payload?.amount,
      name: payload?.name,
      total_amount: payload?.total_amount,
      selections: payload?.selections,
      created_at: new Date(),
      updated_at: new Date(),
    });
    cartItem.product = product;
    // const savedCartItem = await this.cartItemRepository.save(cartItem);

    return cartItem;
  }

  async addToCart(email_address: string, payload: AddToCartDTO) {
    // First check if user is valid
    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
    });

    this.socketGateway.sendNotification(customer?.id, UserType.CUSTOMER, {
      message: 'HELLO TESTING SOCKET.IO !!!',
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

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload?.vendor_id },
    });

    if (!vendor) {
      throw new HttpException(
        {
          message: 'Vendor not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException(
        {
          message: 'Vendor account not active',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const cart = await this.cartRepository.findOne({
      where: {
        vendor: { id: payload?.vendor_id },
        customer: { id: customer?.id },
      },
    });

    if (cart) {
      // Cart already exist. Update items;
      const cartItemAdded = await this.addCartItem(customer?.email_address, {
        amount: payload?.item.amount,
        name: payload?.item?.name,
        product_id: payload?.item?.product_id,
        selections: payload?.item?.selections,
        total_amount: payload?.total_amount,
      });
      cartItemAdded.cart = cart;
      await this.cartItemRepository.save(cartItemAdded);

      // Now get all cart items for this customer and vendor
      const allItems = await this.cartItemRepository.find({
        where: {
          cart: { id: cart?.id },
        },
      });

      let totalAmt = 0;
      for (let index = 0; index < allItems.length; index++) {
        const element = allItems[index];
        totalAmt = totalAmt + element?.total_amount;
      }

      // const cartUpdate = this.cartRepository.create({
      //   total_amount: payload?.total_amount,
      //   updated_at: new Date(),
      // });
      cart.total_amount = totalAmt;
      cart.items = allItems;
      cart.updated_at = new Date();
      const updatedCart = await this.cartRepository.save(cart);

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-cart',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      return {
        message: 'Updated cart successfully',
        data: updatedCart,
      };
    } else {
      const cartItemAdded = await this.addCartItem(customer?.email_address, {
        amount: payload?.item.amount,
        name: payload?.item?.name,
        product_id: payload?.item?.product_id,
        selections: payload?.item?.selections,
        total_amount: payload?.total_amount,
      });

      const cartNew = this.cartRepository.create({
        total_amount: payload?.total_amount,
        vendor_note: payload?.vendor_note,
        created_at: new Date(),
        updated_at: new Date(),
      });

      cartNew.customer = customer;
      cartNew.vendor = vendor;
      cartNew.items = [cartItemAdded];
      const savedCart = await this.cartRepository.save(cartNew);

      cartItemAdded.cart = savedCart;
      await this.cartItemRepository.save(cartItemAdded);

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-cart',
        {
          message: 'ADDED TO CART!',
        },
      );

      return {
        message: 'Added to cart successfully',
        data: savedCart,
      };
    }
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
        .leftJoinAndSelect('cart.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('cart.items', 'items') // Join the related product table
        .leftJoinAndSelect('vendor.categories', 'categories') // Join the related product table
        .leftJoinAndSelect('items.product', 'product') // Join the related product table
        .where('customer.id = :customerId', { customerId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.cartRepository
        .createQueryBuilder('cart') // Alias for the table
        .leftJoin('cart.customer', 'customer') // Join the related vendor table
        .leftJoin('cart.vendor', 'vendor') // Join the related vendor table
        .leftJoin('cart.items', 'items') // Join the related vendor table
        .leftJoinAndSelect('vendor.categories', 'categories') // Join the related product table
        .leftJoinAndSelect('items.product', 'product') // Join the related product table
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
    console.log(payload);

    // cart.amount = payload?.amount;
    // cart.quantity = payload?.quantity;
    cart.updated_at = new Date();

    const updatedCart = await this.cartRepository.save(cart);

    return {
      message: 'Updated to cart successfully',
      data: updatedCart,
    };
  }

  async deleteCartItem(email_address: string, cartItemId: string) {
    if (!cartItemId) {
      throw new HttpException(
        {
          message: 'Cart item Id not provided',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
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

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new HttpException(
        {
          message: 'Cart item not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const cartId = cartItem?.cart?.id;
    await this.cartItemRepository.delete({ id: cartItemId });

    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });
    let t_cart = 0;
    //  now recalculate total amount here
    for (let k = 0; k < cart?.items?.length; k++) {
      const element = cart?.items[k];
      t_cart = t_cart + element?.total_amount;
    }

    cart.total_amount = t_cart;
    await this.cartRepository.save(cart);

    this.socketGateway.sendEvent(
      customer?.id,
      UserType.CUSTOMER,
      'refresh-cart',
      {
        message: 'HELLO TESTING SOCKET.IO !!!',
      },
    );
    return {
      message: 'Cart item deleted successfully',
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

  async addShippingAddress(
    email_address: string,
    payload: AddShippingAddressDTO,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { email_address },
    });

    if (!customer)
      throw new HttpException(
        'No customer record found.',
        HttpStatus.NOT_FOUND,
      );

    const addr = await this.shippingAddressRepository.findOne({
      where: { user: { id: payload?.userId }, landmark: payload?.landmark },
    });

    if (addr)
      throw new HttpException(
        'Address landmark already added',
        HttpStatus.FORBIDDEN,
      );

    const newShippingAddress = this.shippingAddressRepository.create({
      is_default: false,
      address_as: payload?.addressAs,
      landmark: payload?.landmark,
      street: payload?.street,
      locality: payload?.locality,
      latitude: payload?.latitude,
      longitude: payload?.longitude,
      created_at: new Date(),
      updated_at: new Date(),
    });
    newShippingAddress.user = customer;

    await this.shippingAddressRepository.save(newShippingAddress);

    this.socketGateway.sendEvent(
      customer?.id,
      UserType.CUSTOMER,
      'refresh-shipping-address',
      {
        message: 'HELLO TESTING SOCKET.IO !!!',
      },
    );

    return {
      message: 'Shipping address added successfully',
    };
  }

  async customerShippingAddresses(email_address: string) {
    const result = await this.shippingAddressRepository.find({
      where: { user: { email_address: email_address } },
      relations: ['user'],
    });

    return {
      data: result,
      items: result?.length,
    };
  }

  async updateShippingAddress(
    email_address: string,
    addressId: string,
    payload: UpdateShippingAddressDTO,
  ) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const customer = await this.customerRepository.findOne({
      where: { email_address },
    });

    if (!customer)
      throw new HttpException(
        'No customer record found.',
        HttpStatus.NOT_FOUND,
      );

    const shippingAddr = await this.shippingAddressRepository.findOne({
      where: { id: addressId },
    });

    if (!shippingAddr) {
      throw new HttpException(
        {
          message: 'No shipping address found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // const updateAddr = this.shippingAddressRepository.create({
    //   ...payload,
    //   ...shippingAddr,
    //   updated_at: new Date(),
    // });

    shippingAddr.address_as = payload?.addressAs ?? shippingAddr.address_as;
    shippingAddr.landmark = payload?.landmark ?? shippingAddr.landmark;
    shippingAddr.latitude = payload?.latitude ?? shippingAddr.latitude;
    shippingAddr.longitude = payload?.longitude ?? shippingAddr.longitude;
    shippingAddr.street = payload?.street ?? shippingAddr.street;
    shippingAddr.locality = payload?.locality ?? shippingAddr.locality;
    shippingAddr.updated_at = new Date();

    const updatedAddress =
      await this.shippingAddressRepository.save(shippingAddr);

    this.socketGateway.sendEvent(
      customer?.id,
      UserType.CUSTOMER,
      'refresh-shipping-address',
      {
        message: 'HELLO TESTING SOCKET.IO !!!',
      },
    );

    return {
      message: 'Shipping address updated successfully',
      data: updatedAddress,
    };
  }

  async setDefaultShippingAddress(
    email_address: string,
    id: string,
  ): Promise<ShippingAddress> {
    const customer = await this.customerRepository.findOne({
      where: { email_address },
    });

    if (!customer)
      throw new HttpException(
        'No customer record found.',
        HttpStatus.NOT_FOUND,
      );

    // Start a transaction
    return this.shippingAddressRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Update all other gateways to is_default = false
        await transactionalEntityManager.update(
          ShippingAddress,
          { is_default: true },
          { is_default: false },
        );

        // Set the selected gateway to is_default = true
        const updatedAddress = await transactionalEntityManager.update(
          ShippingAddress,
          { id },
          { is_default: true },
        );

        if (updatedAddress.affected === 0) {
          throw new Error(
            'Failed to set the default address. Address not found.',
          );
        }

        this.socketGateway.sendEvent(
          customer?.id,
          UserType.CUSTOMER,
          'refresh-shipping-address',
          {
            message: 'HELLO TESTING SOCKET.IO !!!',
          },
        );

        // Return the updated gateway
        return this.shippingAddressRepository.findOne({ where: { id } });
      },
    );
  }

  async deleteShippingAddress(email_address: string, addressId: string) {
    const customer = await this.customerRepository.findOne({
      where: { email_address },
    });

    if (!customer)
      throw new HttpException(
        'No customer record found.',
        HttpStatus.NOT_FOUND,
      );

    const shippingAddr = await this.shippingAddressRepository.findOne({
      where: { id: addressId },
    });

    if (!shippingAddr) {
      throw new NotFoundException('Shipping address not found');
    }

    await this.shippingAddressRepository.delete(addressId);
    this.socketGateway.sendEvent(
      customer?.id,
      UserType.CUSTOMER,
      'refresh-shipping-address',
      {
        message: 'HELLO TESTING SOCKET.IO !!!',
      },
    );

    return {
      message: 'Shipping address deleted successfully',
    };
  }

  async likeUnlikeVendor(email_address: string, vendorId: string) {
    const customer = await this.customerRepository.findOne({
      where: { email_address: email_address },
    });

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
    }

    const favourite = await this.customerFavsRepository.findOne({
      where: { customer: { id: customer?.id }, vendor: { id: vendorId } },
    });

    if (favourite) {
      // Already addded  so remove now
      await this.customerFavsRepository.delete(favourite?.id);

      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-favourites',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      return {
        message: 'Successfully removed from favourite',
      };
    } else {
      const newFav = this.customerFavsRepository.create({
        created_at: new Date(),
        updated_at: new Date(),
      });

      newFav.customer = customer;
      newFav.vendor = vendor;

      await this.customerFavsRepository.save(newFav);
      this.socketGateway.sendEvent(
        customer?.id,
        UserType.CUSTOMER,
        'refresh-favourites',
        {
          message: 'HELLO TESTING SOCKET.IO !!!',
        },
      );

      return {
        message: 'Successfully added to favourite',
      };
    }
  }

  async customerFavourites(
    page: number,
    limit: number,
    customerId: string,
    vendor_type?: VendorType,
  ) {
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

    console.log('DATA ::: ', vendor_type);

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Construct base query builder
    const queryBuilder = this.customerFavsRepository
      .createQueryBuilder('favourite')
      .leftJoinAndSelect('favourite.customer', 'customer')
      .leftJoinAndSelect('favourite.vendor', 'vendor')
      .leftJoinAndSelect('vendor.categories', 'categories') // Join categories for the vendor
      .leftJoinAndSelect('vendor.zone', 'zone') // Join categories for the vendor
      .where('customer.id = :customerId', { customerId });

    // Add vendor_type condition if provided
    if (vendor_type) {
      queryBuilder.andWhere('vendor.vendor_type = :vendor_type', {
        vendor_type,
      });
    }

    // Fetch data and count in parallel
    const [data, total] = await Promise.all([
      queryBuilder.skip(skip).take(limit).getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async customerWallet(customerId: string) {
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

    // Now get the wallet info for this customer;
    const wallet = await this.walletRepository.findOne({
      where: { customer: { id: customerId } },
    });

    if (!wallet) {
      throw new HttpException(
        {
          message: 'Customer wallet not found!',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('CUSTOEMR WALLET ::: ', wallet);

    return wallet;
  }

  async allfavsIds(customerId: string) {
    const [data, total] = await Promise.all([
      this.customerFavsRepository
        .createQueryBuilder('favourite') // Alias for the table
        .leftJoin('favourite.customer', 'customer') // Join the related customer table
        .leftJoin('favourite.vendor', 'vendor') // Join the related vendor table
        .select(['vendor.id AS vendorId', 'customer.id AS customerId']) // Select specific fields
        .where('customer.id = :customerId', { customerId }) // Filter by customer ID
        .getRawMany(), // Execute query to fetch raw results

      this.customerFavsRepository
        .createQueryBuilder('favourite') // Alias for the table
        .leftJoin('favourite.customer', 'customer') // Join the related customer table
        .where('customer.id = :customerId', { customerId }) // Filter by customer ID
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      totalItems: total,
    };
  }
}
