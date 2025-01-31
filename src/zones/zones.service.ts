import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from 'src/entities/zone.entity';
import { Repository } from 'typeorm';
import { AddZoneDTO } from './dtos/addzone.dto';
import { Admin } from 'src/entities/admin.entity';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { AdminAccess } from 'src/enums/admin.access.enum';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async allZone() {
    return await this.zoneRepository.find({});
  }

  async addZone(email_address: string, payload: AddZoneDTO) {
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
      adm.access !== AdminAccess.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newZone = this.zoneRepository.create({
      boundary: payload.boundary,
      description: payload?.description,
      name: payload?.name,
      region: payload?.region,
    });

    await this.zoneRepository.save(newZone);

    return {
      message: 'Zone added successfully',
    };
  }

  async all(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.zoneRepository
        .createQueryBuilder('zone')
        .skip(skip) // Skip the records
        .take(limit) // Limit the number of records returned
        .getMany(), // Execute query to fetch data
      this.zoneRepository.count(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async findZoneById(zoneID: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id: zoneID },
    });

    if (!zone) {
      return null;
    }

    return zone;
  }

  async updateZone(email_address: string, zoneId: string, payload: AddZoneDTO) {
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
      adm.role !== AdminRoles.EDITOR &&
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.DEVELOPER &&
      adm.access !== AdminAccess.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new HttpException(
        {
          message: 'No zone found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateZone = this.zoneRepository.create({
      ...zone,
      ...payload,
    });

    const updatedZone = await this.zoneRepository.save(updateZone);

    return {
      message: 'Zone updated successfully',
      data: updatedZone,
    };
  }

  async deleteZone(email_address: string, zoneId: string) {
    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== AdminRoles.SUPER_ADMIN &&
      adm.role !== AdminRoles.EDITOR &&
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.DEVELOPER &&
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

    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    await this.zoneRepository.softDelete(zoneId);

    return {
      message: 'Zone deleted successfully',
    };
  }
}
