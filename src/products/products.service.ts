import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Operator } from 'src/entities/operator.entity';
import { Product } from 'src/entities/product.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Repository } from 'typeorm';
import { AddProductDTO } from './dtos/addproduct.dto';
import { Category } from 'src/entities/category.entity';
// import { VendorStatus } from 'src/enums/vendor.status.enum';
import { UpdateProductDTO } from './dtos/updateproduct.dto';
import { ProductStatus } from 'src/enums/product.status.enum';
import { VendorType } from 'src/enums/vendor.type.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
import { VendorLocation } from 'src/entities/vendor.location.entity';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { OperatorRole, OperatorType } from 'src/enums/operator.type.enum';
import { UserType } from 'src/enums/user.type.enum';
import { Coupon } from 'src/entities/coupon.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLocation)
    private vendorLocationRepository: Repository<VendorLocation>,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    private socketGateway: SocketGateway,
  ) {}

  async addProduct(email_address: string, payload: AddProductDTO) {
    const vendorLocation = await this.vendorLocationRepository.findOne({
      where: { id: payload.vendorLocationId },
      relations: ['vendor'],
    });

    if (!vendorLocation) {
      throw new HttpException(
        { message: 'Vendor not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (vendorLocation.vendor.status !== VendorStatus.ACTIVE) {
      throw new HttpException(
        {
          message: `Can\'t add products. Vendor is currently inactive`,
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
      relations: ['vendor'],
    });

    if (!operator) {
      throw new HttpException(
        { message: 'Operator not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      operator.operator_type !== OperatorType.OWNER &&
      operator.operator_role !== OperatorRole.MANAGER &&
      operator.operator_role !== OperatorRole.SUPER
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'You are forbidden to perform this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // const vendor = await this.vendorRepository.findOne({
    //   where: { id: operator?.vendor?.id },
    // });

    // if (!vendor) {
    //   throw new HttpException(
    //     { message: 'Vendor not found', status: HttpStatus.NOT_FOUND },
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    // Now check if category exists
    const category = await this.categoryRepository.findOne({
      where: {
        id: payload?.categoryId,
        vendor: {
          id: vendorLocation?.vendor?.id,
        },
      },
    });

    if (!category) {
      throw new HttpException(
        {
          message: "Vendor's product category not found",
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const product = this.productRepository.create({
      amount: payload?.amount,
      created_at: new Date(),
      description: payload?.description,
      discount_amount: payload?.discount_amount,
      discount_percent: payload?.discount_percent,
      images: payload?.images,
      is_variable: payload?.is_variable,
      name: payload?.name,
      sale_amount: payload?.sale_amount,
      updated_at: new Date(),
      variations: payload?.variations,
      nutrition: payload?.nutrition,
      specifications: payload?.specifications,
      addons: payload?.addons,
    });

    product.category = category;
    product.vendor = operator.vendor;
    product.vendor_location = vendorLocation;
    const savedProduct = await this.productRepository.save(product);

    this.socketGateway.sendVendorNotification(vendorLocation?.vendor?.id, {
      title: `Product added successfully`,
      message: 'A new prodduct has been saved to your product catalogue',
      data: savedProduct,
    });

    this.socketGateway.sendVendorEvent(
      vendorLocation?.vendor?.id,
      'refresh-products',
      {
        action: 'Refreshing products...',
      },
    );

    this.socketGateway.sendEvent(
      operator.id,
      UserType.OPERATOR,
      'refresh-products',
      { message: '' },
    );

    return {
      message: 'Product added successfully',
      data: savedProduct,
    };
  }

  async updateProduct(
    email_address: string,
    productId: string,
    payload: UpdateProductDTO,
  ) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });

    if (!operator) {
      throw new HttpException(
        { message: 'Operator not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      operator.operator_type !== OperatorType.OWNER &&
      operator.operator_role !== OperatorRole.MANAGER &&
      operator.operator_role !== OperatorRole.SUPER
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'You are forbidden to perform this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['vendor'],
    });

    if (!product) {
      throw new HttpException(
        { message: 'Product not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.categoryId) {
      // Update category here
      // Now check if category exists
      const category = await this.categoryRepository.findOne({
        where: { id: payload?.categoryId },
      });

      if (!category) {
        throw new HttpException(
          {
            message: 'Product category not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const { categoryId, ...rest } = payload;
      console.log('Category: ', categoryId);

      await this.productRepository.update(
        {
          id: productId,
        },
        { ...rest },
      );

      product.category = category;
      const savedProduct = await this.productRepository.save(product);

      this.socketGateway.sendVendorNotification(
        product?.vendor_location?.vendor?.id,
        {
          title: `Product updated successfully`,
          message: 'Your product has been updated on your product catalogue',
          data: savedProduct,
        },
      );

      this.socketGateway.sendVendorEvent(
        product?.vendor_location?.vendor?.id,
        'refresh-products',
        {
          action: 'Refreshing productss...',
        },
      );

      return {
        message: 'Product updated successfully',
        data: savedProduct,
      };
    } else {
      // Merge the payload into the existing product object
      const updatedProduct = this.productRepository.create({
        ...product,
        ...payload,
      });

      // Save the updated product
      const savedProduct = await this.productRepository.save(updatedProduct);

      return {
        message: 'Product updated successfully',
        data: savedProduct,
      };
    }
  }

  async findProducts(page: number, limit: number, vendor_type?: VendorType) {
    if (vendor_type) {
      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoinAndSelect('product.category', 'category') // Join the related admin table
          .leftJoinAndSelect('product.vendor', 'vendor')
          .leftJoinAndSelect('product.vendor_location', 'vendor_location')
          .where('product.status != :status', {
            status: ProductStatus.DELETED,
          })
          .andWhere('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoin('product.category', 'category') // Join the related vendor table
          .leftJoin('product.vendor', 'vendor') // Join the related vendor table
          .leftJoin('product.vendor_location', 'vendor_location') // Join the related vendor table
          .where('product.status != :status', {
            status: ProductStatus.DELETED,
          })
          .andWhere('vendor.vendor_type = :vendor_type', { vendor_type }) // Filter by vendor ID
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
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoinAndSelect('product.category', 'category') // Join the related product table
          .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
          .where('product.status != :status', { status: ProductStatus.DELETED })
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.productRepository.count(), // Count total records for pagination
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
  }

  async productList() {
    const data = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.vendor_location', 'vendor_location')
      .select([
        'product.id',
        'product.name',
        'product.images',
        'vendor_location.id',
        'vendor_location.branch_name',
      ])
      .where('product.status != :status', { status: ProductStatus.DELETED })
      .getRawMany(); // Get raw data without entity transformation

    return data;
  }

  async deleteProduct(email_address: string, productId: string) {
    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });

    if (!operator) {
      throw new HttpException(
        { message: 'Operator not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      operator.operator_type !== OperatorType.OWNER &&
      operator.operator_role !== OperatorRole.MANAGER &&
      operator.operator_role !== OperatorRole.SUPER
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'You are forbidden to perform this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(productId);

    return {
      message: 'Product deleted successfully',
    };
  }

  async allByVendor(
    vendorId: string,
    page: number,
    limit: number,
    categoryId?: string,
  ) {
    // First find this vendor first
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        {
          message: 'Vendor record not found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // console.log('VENDOR INFORMATION :::', vendor);

    if (categoryId) {
      //Look for category first
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new HttpException(
          {
            message: 'Product category not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoinAndSelect('product.category', 'category') // Join the related product table
          .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
          .leftJoinAndSelect('product.vendor_location', 'vendor_location') // Join the related product table
          // .select([
          //   'activity',
          //   'admin.first_name',
          //   'admin.last_name',
          //   'admin.emai_address',
          //   'admin.phone_number',
          //   'admin.photo_url',
          //   'admin.role',
          //   'admin.type',
          // ]) // Select only the required fields
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .andWhere('product.category.id = :categoryId', { categoryId }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoin('product.vendor', 'vendor') // Join the related vendor table
          .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
          .andWhere('product.category.id = :categoryId', { categoryId }) // Filter by vendor ID
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

    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.productRepository
        .createQueryBuilder('product') // Alias for the table
        .leftJoinAndSelect('product.category', 'category') // Join the related product table
        .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('product.vendor_location', 'vendor_location') // Join the related product table
        // .select([
        //   'activity',
        //   'admin.first_name',
        //   'admin.last_name',
        //   'admin.emai_address',
        //   'admin.phone_number',
        //   'admin.photo_url',
        //   'admin.role',
        //   'admin.type',
        // ]) // Select only the required fields
        .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.productRepository
        .createQueryBuilder('product') // Alias for the table
        .leftJoin('product.vendor', 'vendor') // Join the related vendor table
        .leftJoin('product.vendor_location', 'vendor_location') // Join the related product table
        .where('vendor.id = :vendorId', { vendorId }) // Filter by vendor ID
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

  async allByBranch(
    branchId: string,
    page: number,
    limit: number,
    categoryId?: string,
  ) {
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

    // // console.log('VENDOR INFORMATION :::', vendor);

    if (categoryId) {
      //Look for category first
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new HttpException(
          {
            message: 'Product category not found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const skip = (page - 1) * limit; // Calculate the number of records to skip
      // Get paginated data and total count
      const [data, total] = await Promise.all([
        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoinAndSelect('product.category', 'category') // Join the related product table
          .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
          .leftJoinAndSelect('product.vendor_location', 'vendor_location') // Join the related product table
          // .select([
          //   'activity',
          //   'admin.first_name',
          //   'admin.last_name',
          //   'admin.emai_address',
          //   'admin.phone_number',
          //   'admin.photo_url',
          //   'admin.role',
          //   'admin.type',
          // ]) // Select only the required fields
          .where('vendor_location.id = :branchId', { branchId }) // Filter by vendor ID
          .andWhere('product.category.id = :categoryId', { categoryId }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records
          .getMany(), // Execute query to fetch data

        this.productRepository
          .createQueryBuilder('product') // Alias for the table
          .leftJoin('product.vendor', 'vendor') // Join the related vendor table
          .leftJoin('product.vendor_location', 'vendor_location') // Join the related vendor table
          .where('vendor_location.id = :branchId', { branchId }) // Filter by vendor ID
          .andWhere('product.category.id = :categoryId', { categoryId }) // Filter by vendor ID
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

    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.productRepository
        .createQueryBuilder('product') // Alias for the table
        .leftJoinAndSelect('product.category', 'category') // Join the related product table
        .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
        .leftJoinAndSelect('product.vendor_location', 'vendor_location') // Join the related product table
        .where('vendor_location.id = :branchId', { branchId }) // Filter by vendor ID
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.productRepository
        .createQueryBuilder('product') // Alias for the table
        .leftJoin('product.vendor', 'vendor') // Join the related vendor table
        .leftJoinAndSelect('product.vendor_location', 'vendor_location')
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

  async allOffers(page: number, limit: number) {
    // First find this vendor first
    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.couponRepository
        .createQueryBuilder('coupon') // Alias for the table
        .leftJoinAndSelect('coupon.vendor', 'vendor') // Join the related product table
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records
        .getMany(), // Execute query to fetch data

      this.couponRepository
        .createQueryBuilder('coupon') // Alias for the table
        .leftJoin('coupon.vendor', 'vendor') // Join the related vendor table
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
}
