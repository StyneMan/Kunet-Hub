import { IdentityType } from 'src/enums/identity.type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OperatorRole, OperatorType } from 'src/enums/operator.type.enum';
import { Vendor } from './vendor.entity';
import { UserStatus } from 'src/enums/user.status.enum';
import { UserType } from 'src/enums/user.type.enum';
import { Exclude } from 'class-transformer';
import { VendorLocation } from './vendor.location.entity';

@Entity({ name: 'operators' })
export class Operator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true, default: '' })
  photo_url?: string;

  @Column({ unique: true, nullable: false })
  email_address: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ type: 'enum', enum: IdentityType, nullable: true })
  identity_type?: IdentityType;

  @Column({ nullable: true })
  identity_number?: string;

  @Column({ type: 'enum', enum: OperatorType })
  operator_type: OperatorType;

  @Column({ type: 'enum', enum: OperatorRole })
  operator_role: OperatorRole;

  @Column({ unique: false, nullable: true })
  intl_phone_format: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  iso_code: string;

  @Column({ type: 'json', nullable: true })
  permissions?: string[];

  @Column({ nullable: true })
  country_code: string;

  @ManyToOne(() => Vendor, (vendor) => vendor)
  @Exclude()
  vendor: Vendor;

  @ManyToOne(() => VendorLocation, (location) => location.staffs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Exclude()
  vendor_location?: VendorLocation;

  @Column({ default: false })
  is_kyc_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  kyc_completed_at?: Date;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserType, default: UserType.OPERATOR })
  user_type?: UserType;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  next_login?: Date | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  last_login?: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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
