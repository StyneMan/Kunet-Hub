import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VendorType } from 'src/enums/vendor.type.enum';
import { Operator } from './operator.entity';
import { Service } from './service.entity';
import { VendorStatus } from 'src/enums/vendor.status.enum';
import { Zone } from './zone.entity';
import { Exclude } from 'class-transformer';
import { Category } from './category.entity';
import { VendorLocation } from './vendor.location.entity';
import { VendorDocument } from './vendor.document.entity';

@Entity({ name: 'vendors' })
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  slogan?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({
    type: 'enum',
    enum: [VendorType.RESTAURANT, VendorType.GROCERY_STORE],
  })
  vendor_type: VendorType;

  @Column({ nullable: false })
  regNo: string;

  @OneToMany(() => Category, (category) => category.vendor, { cascade: true })
  categories: Category[];

  @Column({ nullable: false })
  certificate: string;

  @Column({ nullable: true })
  cover?: string;

  @Column({ nullable: true })
  wallet_pin: string;

  @Column({ nullable: true, default: '' })
  paystack_trf_recipient?: string;

  @Column({ nullable: true })
  logo?: string;

  @OneToOne(() => Operator)
  @JoinColumn()
  @Exclude()
  owner: Operator;

  @ManyToOne(() => Zone)
  @JoinColumn()
  zone: Zone;

  @Column({ nullable: true, default: '' })
  business_email?: string;

  @Column({ nullable: true, default: '' })
  business_phone?: string;

  @Column({ unique: true, nullable: true })
  intl_phone_format?: string;

  @Column({ nullable: true })
  iso_code: string;

  // Services: A vendor can have multiple services
  @OneToMany(() => Service, (service) => service.vendor, {
    cascade: true,
    nullable: true,
  })
  services?: Service[];

  @Column({
    type: 'enum',
    enum: [
      VendorStatus.ACTIVE,
      VendorStatus.DELETED,
      VendorStatus.ON_HOLD,
      VendorStatus.PENDING,
    ],
    default: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @Column({ nullable: false })
  country: string;

  @OneToMany(() => VendorLocation, (location) => location.vendor, {
    cascade: true,
  })
  locations: VendorLocation[];

  @OneToMany(() => VendorDocument, (doc) => doc.owner, {
    cascade: true,
  })
  documents: VendorDocument[];

  @Column({ default: false })
  is_kyc_completed: boolean;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  kyc_completed_at?: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
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
