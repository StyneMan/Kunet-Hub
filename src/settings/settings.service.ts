import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from 'src/entities/faq.entity';
import { Repository } from 'typeorm';
import { AddFAQDTO } from './dtos/addfaq.dto';
import { Admin } from 'src/entities/admin.entity';
import { Legal } from 'src/entities/legal.entity';
// import { UpdateLegalDTO } from './dtos/udatelegal.dto';
import { AdminRoles } from 'src/enums/admin.roles.enum';
import { AdminAccess } from 'src/enums/admin.access.enum';
import { PaymentGateway } from 'src/entities/payment.gateway.entity';
import { AddGatewayDTO } from './dtos/addgateway.dto';
import { UpdateGatewayDTO } from './dtos/updategateway.dto';
import { Size } from 'src/entities/size.entity';
import { Bike } from 'src/entities/bike.entity';
import { Color } from 'src/entities/color.entity';
import { Variation } from 'src/entities/variations.entity';
import { AddColorDTO } from './dtos/addcolor.dto';
import { UpdateColorDTO } from './dtos/updatecolor.dto';
import { AddSizeDTO } from './dtos/addsize.dto';
import { UpdateSizeDTO } from './dtos/updatesize.dto';
import { AddBikeDTO } from './dtos/addbike.dto';
import { UpdateBikeDTO } from './dtos/updatebike.dto';
import { AddVariationDTO } from './dtos/addvariation.dto';
import { UpdateVariationDTO } from './dtos/updatevariation.dto';
import { CommissionAndFee } from 'src/entities/fee.entity';
import { UpdateCommissionAndFeeDTO } from './dtos/updatecomm-fee.dto';
import { AddSMSProviderDTO } from './dtos/addsms.provider.dto';
import { SMSProviders } from 'src/entities/sms.provider.entity';
import { UpdateSMSProviderDTO } from './dtos/updatesms.provider.dto';
import { AddPackOptionDTO } from './dtos/addpack.option.dto';
import { PackOption } from 'src/entities/pack.option.entity';
import { UpdatePackOptionDTO } from './dtos/update.pack.option.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(FAQ)
    private faqRepository: Repository<FAQ>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(Bike)
    private bikeRepository: Repository<Bike>,
    @InjectRepository(Color)
    private colorRepository: Repository<Color>,
    @InjectRepository(Legal)
    private legalRepository: Repository<Legal>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Variation)
    private variationRepository: Repository<Variation>,
    @InjectRepository(PaymentGateway)
    private gatewayRepository: Repository<PaymentGateway>,
    @InjectRepository(SMSProviders)
    private smsProviderRepository: Repository<SMSProviders>,
    @InjectRepository(CommissionAndFee)
    private commissionAndFeeRepository: Repository<CommissionAndFee>,
    @InjectRepository(PackOption)
    private packOptionRepository: Repository<PackOption>,
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

    const fq = await this.faqRepository.findOne({
      where: { question: payload?.question },
    });

    if (fq)
      throw new HttpException(
        'FAQ question already added',
        HttpStatus.NOT_FOUND,
      );

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

  async deleteFAQ(email_address: string, faqId: string) {
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

    await this.faqRepository.delete({ id: faqId });
    return {
      message: 'FAQ item deleted successfully',
    };
  }

  // async updateLegal(email_address: string, payload: UpdateLegalDTO) {
  //   if (!payload) {
  //     throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
  //   }

  //   const adm = await this.adminRepository.findOne({
  //     where: { email_address },
  //   });

  //   if (!adm)
  //     throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

  //   if (
  //     adm.role !== AdminRoles.SUPER_ADMIN &&
  //     adm.role !== AdminRoles.EDITOR &&
  //     adm.role !== AdminRoles.MANAGER &&
  //     adm.role !== AdminRoles.DEVELOPER &&
  //     adm.access !== AdminAccess.READ_WRITE
  //   ) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         message: 'You do not have necessary privileges for this action',
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const legal = await this.legalRepository.find({});
  //   console.log('LEAAL ::: ', legal);

  //   if (legal.length === 0) {
  //     // NOt added yet. Add new
  //     const legalUpdate = this.legalRepository.create({
  //       privacy: payload.privacy,
  //       terms: payload?.terms,
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //     });

  //     const savedLegal = await this.legalRepository.save(legalUpdate);

  //     return {
  //       message: 'Policy/Terms added successfully',
  //       data: savedLegal,
  //     };
  //   } else {
  //     // Perform update here
  //     const legalUpdate = this.legalRepository.create({
  //       ...legal[0],
  //       ...payload,
  //       updated_at: new Date(),
  //     });

  //     const savedLegal = await this.legalRepository.save(legalUpdate);

  //     return {
  //       message: 'Policy/Terms updated successfully',
  //       data: savedLegal,
  //     };
  //   }
  // }

  // Method to insert or update the legal entity
  async updateLegal(
    email_address: string,
    legalData: Partial<Legal>,
  ): Promise<Legal> {
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

    // Check if a legal record already exists
    const existingLegal = await this.legalRepository.find({});

    if (existingLegal?.length > 0) {
      // Update the existing record
      await this.legalRepository.update(existingLegal[0]?.id, legalData);
      return this.legalRepository.findOne({
        where: { id: existingLegal[0]?.id },
      });
    } else {
      // Insert a new record
      const newLegal = this.legalRepository.create(legalData);
      return this.legalRepository.save(newLegal);
    }
  }

  async findLegal() {
    const resp = await this.legalRepository.find({});
    if (!resp) {
      return;
    }
    return resp;
  }

  async addGateway(email_address: string, payload: AddGatewayDTO) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    // const adm = await this.adminRepository.findOne({
    //   where: { email_address },
    // });

    // if (!adm)
    //   throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    // if (
    //   adm.role !== AdminRoles.SUPER_ADMIN &&
    //   adm.access !== AdminAccess.READ_WRITE
    // ) {
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.FORBIDDEN,
    //       message: 'You do not have necessary privileges for this action',
    //     },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    const gt = await this.gatewayRepository.findOne({
      where: { name: payload?.name },
    });

    if (gt)
      throw new HttpException('Gateway already added', HttpStatus.FORBIDDEN);

    const gtw = await this.gatewayRepository.findOne({
      where: { provider: payload?.provider },
    });

    if (gtw)
      throw new HttpException(
        'Gateway provider already added',
        HttpStatus.FORBIDDEN,
      );

    const newGateway = this.gatewayRepository.create({
      name: payload?.name,
      is_default: false,
      encryption: payload?.encryption,
      logo: payload?.logo,
      provider: payload?.provider,
      public_key: payload?.public_key,
      secret_key: payload?.private_key,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.gatewayRepository.save(newGateway);

    return {
      message: 'Gateway added successfully',
    };
  }

  async allGateways() {
    return await this.gatewayRepository.find({});
  }

  async updateGateway(
    email_address: string,
    gatewayId: string,
    payload: UpdateGatewayDTO,
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

    const gateway = await this.gatewayRepository.findOne({
      where: { id: gatewayId },
    });

    if (!gateway) {
      throw new HttpException(
        {
          message: 'No gateway found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    gateway.logo = payload?.logo ?? gateway?.logo;
    gateway.name = payload?.name ?? gateway?.name;
    gateway.provider = payload?.provider ?? gateway?.provider;
    gateway.public_key = payload?.public_key ?? gateway?.public_key;
    gateway.secret_key = payload?.private_key ?? gateway?.secret_key;
    gateway.encryption = payload?.encryption ?? gateway?.encryption;
    gateway.updated_at = new Date();

    const updatedGateway = await this.gatewayRepository.save(gateway);

    console.log('JKJS JHSA ::: ', updatedGateway);

    return {
      message: 'Gateway provider updated successfully',
      data: updatedGateway,
    };
  }

  async setDefaultGateway(
    email_address: string,
    id: string,
  ): Promise<PaymentGateway> {
    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== AdminRoles.SUPER_ADMIN &&
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

    // Start a transaction
    return this.gatewayRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Update all other gateways to is_default = false
        await transactionalEntityManager.update(
          PaymentGateway,
          { is_default: true },
          { is_default: false },
        );

        // Set the selected gateway to is_default = true
        const updatedGateway = await transactionalEntityManager.update(
          PaymentGateway,
          { id },
          { is_default: true },
        );

        if (updatedGateway.affected === 0) {
          throw new Error(
            'Failed to set the default gateway. Gateway not found.',
          );
        }

        // Return the updated gateway
        return this.gatewayRepository.findOne({ where: { id } });
      },
    );
  }

  async deleteGateway(email_address: string, gatewayId: string) {
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

    const gateway = await this.gatewayRepository.findOne({
      where: { id: gatewayId },
    });

    if (!gateway) {
      throw new NotFoundException('Gateway provider not found');
    }

    await this.gatewayRepository.softDelete(gatewayId);

    return {
      message: 'Gateway provider deleted successfully',
    };
  }

  async addColor(email_address: string, payload: AddColorDTO) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const gt = await this.colorRepository.findOne({
      where: { name: payload?.name },
    });

    if (gt)
      throw new HttpException('Color already added', HttpStatus.FORBIDDEN);

    const gtw = await this.colorRepository.findOne({
      where: { code: payload?.code },
    });

    if (gtw)
      throw new HttpException(
        'Color hex code already added',
        HttpStatus.FORBIDDEN,
      );

    const newColor = this.colorRepository.create({
      name: payload?.name,
      code: payload?.code,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.colorRepository.save(newColor);

    return {
      message: 'Color added successfully',
    };
  }

  async allColors() {
    return await this.colorRepository.find({});
  }

  async updateColor(
    email_address: string,
    colorId: string,
    payload: UpdateColorDTO,
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

    const color = await this.colorRepository.findOne({
      where: { id: colorId },
    });

    if (!color) {
      throw new HttpException(
        {
          message: 'No color found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateColor = this.colorRepository.create({
      ...color,
      ...payload,
    });

    const updatedColor = await this.gatewayRepository.save(updateColor);

    return {
      message: 'Color updated successfully',
      data: updatedColor,
    };
  }

  async deleteColor(email_address: string, colorId: string) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const color = await this.colorRepository.findOne({
      where: { id: colorId },
    });

    if (!color) {
      throw new NotFoundException('Color not found');
    }

    await this.colorRepository.delete(colorId);

    return {
      message: 'Color deleted successfully',
    };
  }

  async addSize(email_address: string, payload: AddSizeDTO) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const gt = await this.sizeRepository.findOne({
      where: { name: payload?.name },
    });

    if (gt) throw new HttpException('Size already added', HttpStatus.FORBIDDEN);

    const newSize = this.sizeRepository.create({
      name: payload?.name,
      value: payload?.value,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.sizeRepository.save(newSize);

    return {
      message: 'Size added successfully',
    };
  }

  async allSizes() {
    return await this.sizeRepository.find({});
  }

  async updateSize(
    email_address: string,
    sizeId: string,
    payload: UpdateSizeDTO,
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

    const size = await this.sizeRepository.findOne({
      where: { id: sizeId },
    });

    if (!size) {
      throw new HttpException(
        {
          message: 'No size found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateSize = this.sizeRepository.create({
      ...size,
      ...payload,
    });

    const updatedSize = await this.gatewayRepository.save(updateSize);

    return {
      message: 'Size updated successfully',
      data: updatedSize,
    };
  }

  async deleteSize(email_address: string, sizeId: string) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const size = await this.sizeRepository.findOne({
      where: { id: sizeId },
    });

    if (!size) {
      throw new NotFoundException('Size not found');
    }

    await this.sizeRepository.delete(sizeId);

    return {
      message: 'Size deleted successfully',
    };
  }

  async addBike(email_address: string, payload: AddBikeDTO) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const colorFound = await this.colorRepository.findOne({
      where: { id: payload?.colorId },
    });

    if (!colorFound)
      throw new HttpException('Color not found', HttpStatus.NOT_FOUND);

    const gt = await this.bikeRepository.findOne({
      where: { reg_number: payload?.reg_number },
    });

    if (gt) throw new HttpException('Bike already added', HttpStatus.FORBIDDEN);

    const newBike = this.bikeRepository.create({
      make: payload?.make,
      reg_number: payload?.reg_number,
      model: payload?.model,
      type: payload?.type,
      created_at: new Date(),
      updated_at: new Date(),
    });
    newBike.color = colorFound;

    await this.bikeRepository.save(newBike);

    return {
      message: 'Bike added successfully',
    };
  }

  async allBikes() {
    return await this.sizeRepository.find({});
  }

  async updateBike(
    email_address: string,
    bikeId: string,
    payload: UpdateBikeDTO,
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

    const bike = await this.bikeRepository.findOne({
      where: { id: bikeId },
    });

    if (!bike) {
      throw new HttpException(
        {
          message: 'No bike found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.colorId) {
      const color = await this.colorRepository.findOne({
        where: { id: payload?.colorId },
      });

      if (!color) {
        throw new HttpException(
          {
            message: 'No color found with the given ID',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updateBike = this.bikeRepository.create({
        ...bike,
        ...payload,
      });
      updateBike.color = color;
      const updatedBike = await this.bikeRepository.save(updateBike);

      return {
        message: 'Bike updated successfully',
        data: updatedBike,
      };
    } else {
      const updateBike = this.bikeRepository.create({
        ...bike,
        ...payload,
      });

      const updatedBike = await this.bikeRepository.save(updateBike);

      return {
        message: 'Bike updated successfully',
        data: updatedBike,
      };
    }
  }

  async deleteBike(email_address: string, bikeId: string) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const bike = await this.bikeRepository.findOne({
      where: { id: bikeId },
    });

    if (!bike) {
      throw new NotFoundException('Bike not found');
    }

    await this.bikeRepository.delete(bikeId);

    return {
      message: 'Bike deleted successfully',
    };
  }

  async addVariation(email_address: string, payload: AddVariationDTO) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload?.colorId) {
      const color = await this.colorRepository.findOne({
        where: { id: payload?.colorId },
      });

      if (!color) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: 'Color not found!',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const newVariation = this.variationRepository.create({
        type: payload?.type,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newVariation.color = color;

      await this.variationRepository.save(newVariation);

      return {
        message: 'Variation added successfully',
      };
    }

    if (payload?.sizeId) {
      const size = await this.sizeRepository.findOne({
        where: { id: payload?.sizeId },
      });

      if (!size) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: 'Size with given ID not found!',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const newVariation = this.variationRepository.create({
        type: payload?.type,
        created_at: new Date(),
        updated_at: new Date(),
      });
      newVariation.size = size;

      await this.variationRepository.save(newVariation);

      return {
        message: 'Variation added successfully',
      };
    }
  }

  async allVariations() {
    return await this.variationRepository.find({
      relations: ['color', 'size'],
    });
  }

  async updateVariation(
    email_address: string,
    variationId: string,
    payload: UpdateVariationDTO,
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

    const variation = await this.variationRepository.findOne({
      where: { id: variationId },
    });

    if (!variation) {
      throw new HttpException(
        {
          message: 'No variation found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload?.colorId) {
      const color = await this.colorRepository.findOne({
        where: { id: payload?.colorId },
      });

      if (!color) {
        throw new HttpException(
          {
            message: 'No color found with the given ID',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updateVar = this.variationRepository.create({
        ...variation,
        ...payload,
      });
      updateVar.color = color;
      const updatedVariation = await this.variationRepository.save(updateVar);

      return {
        message: 'Variation updated successfully',
        data: updatedVariation,
      };
    }

    if (payload?.sizeId) {
      const size = await this.sizeRepository.findOne({
        where: { id: payload?.sizeId },
      });

      if (!size) {
        throw new HttpException(
          {
            message: 'No size found with the given ID',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updateVar = this.variationRepository.create({
        ...variation,
        ...payload,
      });
      updateVar.size = size;
      const updatedVariation = await this.variationRepository.save(updateVar);

      return {
        message: 'Variation updated successfully',
        data: updatedVariation,
      };
    }

    const updateVariation = this.variationRepository.create({
      ...variation,
      ...payload,
    });

    const updatedVariation =
      await this.variationRepository.save(updateVariation);

    return {
      message: 'Variation updated successfully',
      data: updatedVariation,
    };
  }

  async deleteVariation(email_address: string, variationId: string) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const bike = await this.variationRepository.findOne({
      where: { id: variationId },
    });

    if (!bike) {
      throw new NotFoundException('Variaiton not found');
    }

    await this.variationRepository.delete(variationId);

    return {
      message: 'Variation deleted successfully',
    };
  }

  // Method to insert or update the legal entity
  async upsertFees(email_address: string, feeData: UpdateCommissionAndFeeDTO) {
    console.log('FEE PAYLOAD ::: ', feeData);

    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== AdminRoles.SUPER_ADMIN &&
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
    // Check if a legal record already exists
    const existingFee = await this.commissionAndFeeRepository.find({});

    if (existingFee?.length > 0) {
      // Update the existing record
      await this.commissionAndFeeRepository.update(
        { id: existingFee[0]?.id },
        { ...feeData, updated_at: new Date() },
      );
      const updated = await this.commissionAndFeeRepository.findOne({
        where: { id: existingFee[0]?.id },
      });
      return {
        message: 'Updated successfully',
        data: updated,
      };
    } else {
      // Insert a new record
      const newLegal = this.commissionAndFeeRepository.create({
        ...feeData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const resp = await this.commissionAndFeeRepository.save(newLegal);
      return {
        message: 'Updated successfully',
        data: resp,
      };
    }
  }

  // Method to fetch the single legal record
  async getFees(): Promise<CommissionAndFee[]> {
    return this.commissionAndFeeRepository.find({});
  }

  async addSMSProvider(email_address: string, payload: AddSMSProviderDTO) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const sms = await this.smsProviderRepository.findOne({
      where: { sender_name: payload?.sender_name },
    });

    if (sms)
      throw new HttpException(
        'SMS provider already added',
        HttpStatus.FORBIDDEN,
      );

    const prv = await this.smsProviderRepository.findOne({
      where: { provider: payload?.provider },
    });

    if (prv)
      throw new HttpException(
        'SMS provider already added',
        HttpStatus.FORBIDDEN,
      );

    const newProvider = this.smsProviderRepository.create({
      sender_name: payload?.sender_name,
      sender_id: payload?.sender_id,
      is_default: false,
      provider: payload?.provider,
      public_key: payload?.public_key,
      private_key: payload?.private_key,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.smsProviderRepository.save(newProvider);

    return {
      message: 'SMS provider added successfully',
    };
  }

  async allSMSProviders() {
    return await this.smsProviderRepository.find({});
  }

  async updateSMSProvider(
    email_address: string,
    providerId: string,
    payload: UpdateSMSProviderDTO,
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

    const provider = await this.smsProviderRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new HttpException(
        {
          message: 'No provider found with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateProvider = this.smsProviderRepository.create({
      ...payload,
      ...provider,
      updated_at: new Date(),
    });

    const updatedProvider =
      await this.smsProviderRepository.save(updateProvider);

    return {
      message: 'SMS provider updated successfully',
      data: updatedProvider,
    };
  }

  async setDefaultSMSProvider(
    email_address: string,
    id: string,
  ): Promise<SMSProviders> {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Start a transaction
    return this.smsProviderRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Update all other gateways to is_default = false
        await transactionalEntityManager.update(
          SMSProviders,
          { is_default: true },
          { is_default: false },
        );

        // Set the selected gateway to is_default = true
        const updatedProvider = await transactionalEntityManager.update(
          SMSProviders,
          { id },
          { is_default: true },
        );

        if (updatedProvider.affected === 0) {
          throw new Error(
            'Failed to set the default gateway. Gateway not found.',
          );
        }

        // Return the updated gateway
        return this.smsProviderRepository.findOne({ where: { id } });
      },
    );
  }

  async deleteSMSProvider(email_address: string, providerId: string) {
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
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have necessary privileges for this action',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const provider = await this.smsProviderRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('SMS provider not found');
    }

    await this.smsProviderRepository.softDelete(providerId);

    return {
      message: 'SMS provider deleted successfully',
    };
  }

  async addPackoption(email_address: string, payload: AddPackOptionDTO) {
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

    const pack = await this.packOptionRepository.findOne({
      where: { name: payload?.name },
    });

    if (pack)
      throw new HttpException(
        'Pack option already added',
        HttpStatus.FORBIDDEN,
      );

    const newPack = this.packOptionRepository.create({
      name: payload?.name,
      cost: payload?.cost,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.packOptionRepository.save(newPack);

    return {
      message: 'Pack option added successfully',
    };
  }

  async allPackOptions() {
    return await this.packOptionRepository.find({});
  }

  async updatePackOption(
    email_address: string,
    packId: string,
    payload: UpdatePackOptionDTO,
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

    const pack = await this.packOptionRepository.findOne({
      where: { id: packId },
    });

    if (!pack) {
      throw new HttpException(
        {
          message: 'No pack option with the given ID',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatePack = this.packOptionRepository.create({
      ...payload,
      ...pack,
      updated_at: new Date(),
    });

    const updatedPackOption = await this.packOptionRepository.save(updatePack);

    return {
      message: 'Pack option updated successfully',
      data: updatedPackOption,
    };
  }

  async deletePackOption(email_address: string, packId: string) {
    const adm = await this.adminRepository.findOne({
      where: { email_address },
    });

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.role !== AdminRoles.SUPER_ADMIN &&
      adm.role !== AdminRoles.MANAGER &&
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

    const pack = await this.packOptionRepository.findOne({
      where: { id: packId },
    });

    if (!pack) {
      throw new NotFoundException('Pack option not found');
    }

    await this.packOptionRepository.delete(packId);

    return {
      message: 'Pack option deleted successfully',
    };
  }
}
