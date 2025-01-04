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

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async allZone() {
    return await this.zoneRepository.find({});
  }

  async addZone(payload: AddZoneDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const newZone = this.zoneRepository.create({
      boundary: payload.boundary,
      description: payload?.description,
      name: payload?.name,
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

    return zone;
  }

  async updateZone(zoneId: string, payload: AddZoneDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
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

    zone.boundary = payload.boundary;
    zone.description = payload.description;
    zone.name = payload.name;
    zone.updated_at = new Date();

    const updatedZone = await this.zoneRepository.save(zone);

    return {
      message: 'Zone updated successfully',
      data: updatedZone,
    };
  }

  async deleteZone(zoneId: string) {
    const product = await this.zoneRepository.findOne({
      where: { id: zoneId },
    });

    if (!product) {
      throw new NotFoundException('Zone not found');
    }

    await this.zoneRepository.softDelete(zoneId);

    return {
      message: 'Zone deleted successfully',
    };
  }
}
