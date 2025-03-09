import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Customer } from 'src/entities/customer.entity';
import { Rider } from 'src/entities/rider.entity';
import { Support } from 'src/entities/support.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { Repository } from 'typeorm';
import { AddSupportDTO } from './dtos/addsupport.dto';
import generateRandomPassword from 'src/utils/password_generator';
import { SupportStatus } from 'src/enums/support.status.enum';
import { UpdateSupportDTO } from './dtos/updatesupport.dto';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { SupportType } from 'src/enums/support.type.enum';

@Injectable()
export class SupportsService {
  constructor(
    @InjectRepository(Support)
    private supportRepository: Repository<Support>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async addSupport(payload: AddSupportDTO) {
    const ticket_no = `fst-${payload?.email_address}-${generateRandomPassword(10)}`;

    const newSupport = this.supportRepository.create({
      email_address: payload?.email_address,
      first_name: payload?.first_name,
      last_name: payload?.last_name,
      subject: payload?.subject,
      message: payload?.message,
      ticket_no: ticket_no,
      support_type: payload?.support_type,
      ticket_status: SupportStatus.SUBMITTED,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.supportRepository.save(newSupport);

    // Send support email here

    return {
      message: 'Support submitted successfully',
    };
  }

  async all(page: number, limit: number, support_type?: SupportType) {
    if (support_type) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.supportRepository
          .createQueryBuilder('support') // Alias for the Admin table
          .where('support.support_type = :support_type', { support_type }) // Filter by vendor ID
          .skip(skip) // Skip the records
          .take(limit) // Limit the number of records returned
          .getMany(), // Execute query to fetch data

        this.supportRepository
          .createQueryBuilder('support') // Alias for the table
          .where('support.support_type = :support_type', { support_type }) // Filter by vendor ID
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
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.supportRepository
        .createQueryBuilder('support')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.supportRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async updateSupport(
    email_address: string,
    supportId: string,
    payload: UpdateSupportDTO,
  ) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== AdminRoles.SUPER_ADMIN &&
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.DEVELOPER &&
      adm.role !== AdminRoles.SUPPORT &&
      adm.access !== AdminAccess.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const support = await this.supportRepository.findOne({
      where: { id: supportId },
    });

    if (!support) {
      throw new HttpException(
        {
          message: 'No support found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateSupport = this.supportRepository.create({
      ...support,
      ...payload,
    });

    const updatedSupport = await this.supportRepository.save(updateSupport);

    return {
      message: 'Support updated successfully',
      data: updatedSupport,
    };
  }
}
