import { IdentityType } from 'src/enums/identity.type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatus } from 'src/enums/user.status.enum';
import { UserType } from 'src/enums/user.type.enum';
import { Zone } from './zone.entity';
import { Bike } from './bike.entity';
import { BikeType } from 'src/enums/bike.type.enum';

@Entity({ name: 'riders' })
export class Rider {
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

  @Column({ unique: true })
  email_address: string;

  @Column({ nullable: true })
  fcmToken?: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ default: false })
  is_online: boolean;

  @Column({ default: false })
  today_orders: number;

  @Column({ type: 'enum', enum: IdentityType, nullable: false })
  identity_type: IdentityType;

  @Column({ unique: false, nullable: false })
  identity_number: string;

  @Column({ nullable: false })
  id_front_view: string;

  @Column({ nullable: true })
  id_back_view: string;

  @Column({ unique: false, nullable: true })
  intl_phone_format: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  iso_code: string;

  @Column({ nullable: true })
  country_code: string;

  @Column({ nullable: true, default: 1.0 })
  rating: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  current_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  current_lng: number;

  @Column({ default: false })
  is_kyc_completed: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserType, default: UserType.RIDER })
  user_type?: UserType;

  @Column({ nullable: true })
  wallet_pin: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @ManyToOne(() => Zone)
  @JoinColumn()
  zone: Zone;

  @OneToMany(() => Bike, (bike) => bike.rider, {
    cascade: true,
    nullable: true,
  })
  vehicle: Bike;

  @Column({ nullable: true, default: '123abc' })
  bike_reg_number?: string;

  @Column({ type: 'enum', enum: BikeType })
  bike_type: BikeType;

  @Column({ type: 'timestamp', nullable: true, default: null })
  kyc_completed_at?: Date | null;

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
