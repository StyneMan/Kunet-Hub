import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Banner } from 'src/entities/banner.entity';
import { Repository } from 'typeorm';
import { AddBannerDTO } from './dtos/add.banner.dto';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { Product } from 'src/entities/product.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { UpdateBannerDTO } from './dtos/update.banner.dto';
import { VendorLocation } from 'src/entities/vendor.location.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLocation)
    private vendorLocationRepository: Repository<VendorLocation>,
  ) {}

  async addBanner(email_address: string, payload: AddBannerDTO) {
    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!admin) {
      throw new HttpException(
        {
          message: 'Admin not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      admin.access !== AdminAccess.READ_WRITE &&
      admin.role !== AdminRoles.SUPER_ADMIN &&
      admin.role !== AdminRoles.MANAGER &&
      admin.role !== AdminRoles.EDITOR
    ) {
      throw new HttpException(
        {
          message: 'You are forbidden',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload?.productId) {
      // Product banner
      const product = await this.productRepository.findOne({
        where: { id: payload?.productId },
      });

      if (!product) {
        throw new HttpException(
          {
            message: 'Product not found!',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const newBanner = this.bannerRepository.create({
        title: payload?.title,
        banner_type: payload?.banner_type,
        image_res: payload?.imageUrl,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newBanner.product = product;
      const savedBanner = await this.bannerRepository.save(newBanner);

      return {
        message: 'Banner added successfully',
        data: savedBanner,
      };
    } else if (payload?.vendorLocationId) {
      // Product banner
      const vendorLocation = await this.vendorLocationRepository.findOne({
        where: { id: payload?.vendorLocationId },
      });

      if (!vendorLocation) {
        throw new HttpException(
          {
            message: 'Vendor not found!',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const newBanner = this.bannerRepository.create({
        title: payload?.title,
        banner_type: payload?.banner_type,
        image_res: payload?.imageUrl,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newBanner.vendor_location = vendorLocation;
      const savedBanner = await this.bannerRepository.save(newBanner);

      return {
        message: 'Banner added successfully',
        data: savedBanner,
      };
    } else {
      const newBanner = this.bannerRepository.create({
        title: payload?.title,
        banner_type: payload?.banner_type,
        image_res: payload?.imageUrl,
        external_link: payload?.external_link,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const savedBanner = await this.bannerRepository.save(newBanner);

      return {
        message: 'Banner added successfully',
        data: savedBanner,
      };
    }
  }

  async allBanners(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.bannerRepository
        .createQueryBuilder('banner') // Alias for the Admin table
        .orderBy('banner.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.bannerRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async publishedBanners(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.bannerRepository
        .createQueryBuilder('banner') // Alias for the Admin table
        .leftJoinAndSelect('banner.product', 'product') // Join the related admin table
        .leftJoinAndSelect('banner.vendor_location', 'vendor_location') // Join the related admin table
        .leftJoinAndSelect('vendor_location.vendor', 'vendor') // Join the related admin table
        .leftJoinAndSelect('vendor.zone', 'zone') // Join the related admin table
        .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
        .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
        .where('banner.is_published = :is_published', { is_published: true })
        .orderBy('banner.created_at', 'DESC')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data

      this.bannerRepository
        .createQueryBuilder('banner') // Alias for the Admin table
        .leftJoinAndSelect('banner.vendor_location', 'vendor_location') // Join the related admin table
        .leftJoin('vendor_location.vendor', 'vendor') // Join the related vendor table
        .leftJoin('vendor.owner', 'owner') // Join the related vendor table
        .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
        .where('banner.is_published = :is_published', { is_published: true })
        .getCount(), // Count total records for pagination
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
    // const data = await this.bannerRepository
    //   .createQueryBuilder('banner')
    //   .leftJoinAndSelect('banner.vendor_location', 'vendor_location') // Join the related admin table
    //   .leftJoinAndSelect('banner.product', 'product') // Join the related admin table
    //   .leftJoinAndSelect('vendor_location.vendor', 'vendor') // Join the related admin table
    //   .leftJoinAndSelect('vendor.zone', 'zone') // Join the related admin table
    //   .leftJoinAndSelect('vendor.owner', 'owner') // Join the related admin table
    //   .leftJoinAndSelect('vendor.categories', 'categories') // Include categories
    //   .orderBy('banner.created_at', 'DESC')
    //   .where('banner.is_published = :is_published', { is_published: true })
    //   .getRawMany(); // Get raw data without entity transformation

    // console.log('PUBLISHED BANNERS::', data);

    // return data;
  }

  async updateBanner(
    email_address: string,
    bannerId: string,
    payload: UpdateBannerDTO,
  ) {
    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!admin) {
      throw new HttpException(
        {
          message: 'Admin not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      admin.access !== AdminAccess.READ_WRITE &&
      admin.role !== AdminRoles.SUPER_ADMIN &&
      admin.role !== AdminRoles.MANAGER &&
      admin.role !== AdminRoles.EDITOR
    ) {
      throw new HttpException(
        {
          message: 'You are forbidden',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new HttpException(
        {
          message: 'No banner record found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.vendorLocationId) {
      // Update vedor locaiton here
      const vendorLocation = await this.vendorLocationRepository.findOne({
        where: { id: payload?.vendorLocationId },
      });

      if (!vendorLocation) {
        throw new HttpException(
          {
            message: 'Vendor not found!',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      banner.title = payload?.title ?? banner.title;
      banner.is_published = payload?.isPublished ?? banner.is_published;
      banner.vendor_location = vendorLocation ?? banner.vendor_location;
      banner.image_res = payload?.imageUrl ?? banner.image_res;
      banner.updated_at = new Date();

      const updatedBanner = await this.bannerRepository.save(banner);

      return {
        message: 'Banner updated successfully',
        data: updatedBanner,
      };
    } else if (payload?.productId) {
      const product = await this.productRepository.findOne({
        where: { id: payload?.productId },
      });

      if (!product) {
        throw new HttpException(
          {
            message: 'Product not found!',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      banner.title = payload?.title ?? banner.title;
      banner.is_published = payload?.isPublished ?? banner.is_published;
      banner.product = product ?? banner.product;
      banner.image_res = payload?.imageUrl ?? banner.image_res;
      banner.updated_at = new Date();

      const updatedBanner = await this.bannerRepository.save(banner);
      return {
        message: 'Banner updated successfully',
        data: updatedBanner,
      };
    } else {
      banner.title = payload?.title ?? banner.title;
      banner.is_published = payload?.isPublished ?? banner.is_published;
      banner.external_link = payload?.external_link ?? banner.external_link;
      banner.image_res = payload?.imageUrl ?? banner.image_res;
      banner.updated_at = new Date();

      const updatedBanner = await this.bannerRepository.save(banner);
      return {
        message: 'Banner updated successfully',
        data: updatedBanner,
      };
    }
  }

  async deleteBanner(email_address: string, bannerId: string) {
    const admin = await this.adminRepository.findOne({
      where: { email_address: email_address },
    });

    if (!admin) {
      throw new HttpException(
        {
          message: 'Admin not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      admin.access !== AdminAccess.READ_WRITE &&
      admin.role !== AdminRoles.SUPER_ADMIN &&
      admin.role !== AdminRoles.MANAGER &&
      admin.role !== AdminRoles.EDITOR
    ) {
      throw new HttpException(
        {
          message: 'You are forbidden',
          error: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new HttpException(
        {
          message: 'Banner not found!',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.bannerRepository.delete({ id: bannerId });

    return {
      message: 'Banner deleted successfully',
    };
  }
}
