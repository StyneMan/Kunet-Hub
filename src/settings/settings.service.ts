import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from 'src/entities/faq.entity';
import { Repository } from 'typeorm';
import { AddFAQDTO } from './dtos/addfaq.dto';
import { Admin } from 'src/entities/admin.entity';
import { Legal } from 'src/entities/legal.entity';
import { UpdateLegalDTO } from './dtos/udatelegal.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(FAQ)
    private faqRepository: Repository<FAQ>,
    @InjectRepository(Legal)
    private legalRepository: Repository<Legal>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async addFAQ(email_address: string, payload: AddFAQDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const faq = this.faqRepository.create({
      question: payload.question,
      answer: payload.answer,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedFAQ = await this.faqRepository.save(faq);

    return {
      message: 'FAQ added successfully',
      data: savedFAQ,
    };
  }

  async allFAQs() {
    return await this.faqRepository.find({});
  }

  async updateFAQ(email_address: string, faqId: string, payload: AddFAQDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const faq = await this.faqRepository.findOne({
      where: { id: faqId },
    });

    if (!faq)
      throw new HttpException(
        { message: 'FAQ record not found!', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );

    const faqUpdate = this.faqRepository.create({
      ...faq,
      ...payload,
      updated_at: new Date(),
    });

    const savedFAQ = await this.faqRepository.save(faqUpdate);

    return {
      message: 'FAQ updated successfully',
      data: savedFAQ,
    };
  }

  async deleteFAQ(faqId: string) {
    await this.faqRepository.delete({ id: faqId });
    return {
      message: 'FAQ item deleted successfully',
    };
  }

  async updateLegal(
    email_address: string,
    id: string,
    payload: UpdateLegalDTO,
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
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const legal = await this.legalRepository.find({});

    if (legal.length === 0) {
      // NOt added yet. Add new
      const legalUpdate = this.legalRepository.create({
        privacy: payload.privacy ?? '',
        terms: payload?.terms ?? '',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const savedLegal = await this.legalRepository.save(legalUpdate);

      return {
        message: 'Policy/Terms added successfully',
        data: savedLegal,
      };
    } else {
      // Perform update here
      const legalUpdate = this.legalRepository.create({
        ...legal[0],
        ...payload,
        updated_at: new Date(),
      });

      const savedLegal = await this.legalRepository.save(legalUpdate);

      return {
        message: 'Policy/Terms updated successfully',
        data: savedLegal,
      };
    }
  }

  async findLegal() {
    const resp = await this.faqRepository.find({});
    return resp;
  }
}
