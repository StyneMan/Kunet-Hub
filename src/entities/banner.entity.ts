import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BannerType } from 'src/enums/banner.type.enum';
import { Product } from './product.entity';
import { VendorLocation } from './vendor.location.entity';

@Entity({ name: 'banners' })
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  image_res: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  external_link?: string;

  @ManyToOne(() => Product, { nullable: true })
  product?: Product;

  @Column({ nullable: true, default: false })
  is_published: boolean;

  @Column({ type: 'enum', enum: BannerType })
  banner_type: BannerType;

  @ManyToOne(() => VendorLocation, { nullable: true })
  vendor_location?: VendorLocation;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  updated_at: Date;

  @BeforeInsert()
  updateDates() {
    this.updated_at = new Date();
  }

  @BeforeUpdate()
  updateAgain() {
    this.updated_at = new Date();
  }
}
