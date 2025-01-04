import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async addProduct(email_address: string, payload: AddProductDTO) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: payload.vendorId },
    });

    if (!vendor) {
      throw new HttpException(
        { message: 'Vendor not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    // if (vendor.status !== VendorStatus.ACTIVE) {
    //   throw new HttpException(
    //     {
    //       message: `Can\'t add products. Vendor is currently ${vendor.status}`,
    //       status: HttpStatus.BAD_REQUEST,
    //     },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const operator = await this.operatorRepository.findOne({
      where: { email_address: email_address },
    });

    if (!operator) {
      throw new HttpException(
        { message: 'Operator not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    // Now chek if category exists
    const category = await this.categoryRepository.findOne({
      where: {
        id: payload?.categoryId,
        vendor: {
          id: vendor?.id,
        },
      },
      relations: ['vendor'],
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
    });

    product.category = category;
    product.vendor = vendor;
    const savedProduct = await this.productRepository.save(product);

    return {
      message: 'Product added successfully',
      data: savedProduct,
    };
  }

  async updateProduct(productId: string, payload: UpdateProductDTO) {
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

  // async deleteProduct(productId: string) {
  //   const product = await this.productRepository.findOne({
  //     where: { id: productId },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }

  //   await this.productRepository.softDelete(productId);

  //   return {
  //     message: 'Product deleted successfully',
  //   };
  // }

  async allByVendor(vendorId: string, page: number, limit: number) {
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

    console.log('VENDOR INFORMATION :::', vendor);

    const skip = (page - 1) * limit; // Calculate the number of records to skip
    // Get paginated data and total count
    const [data, total] = await Promise.all([
      this.productRepository
        .createQueryBuilder('product') // Alias for the table
        .leftJoinAndSelect('product.category', 'category') // Join the related product table
        .leftJoinAndSelect('product.vendor', 'vendor') // Join the related product table
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
}
