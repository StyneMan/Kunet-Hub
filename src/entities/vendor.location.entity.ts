import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { Product } from './product.entity';
import { Operator } from './operator.entity';
import { Exclude } from 'class-transformer';
import { VendorLocationStatus } from 'src/enums/vendor.status.enum';

@Entity({ name: 'vendor_locations' })
export class VendorLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  branch_name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: false,
    default: 6.569984,
  })
  lat: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: false,
    default: 3.342336,
  })
  lng: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.locations, {
    onDelete: 'CASCADE',
  })
  vendor: Vendor;

  @OneToMany(() => Product, (product) => product.vendor_location, {
    cascade: true,
  })
  products: Product[];

  @OneToMany(() => Operator, (operator) => operator.vendor_location, {
    cascade: true,
  })
  @Exclude()
  staffs?: Operator[];

  @Column({ nullable: false })
  region: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  street: string;

  @Column({ nullable: true, default: '' })
  business_email?: string;

  @Column({ nullable: true, default: '' })
  business_phone?: string;

  @Column({ unique: true, nullable: true })
  intl_phone_format?: string;

  @Column({ nullable: true })
  iso_code: string;

  @Column({ nullable: true, default: 1.0 })
  rating: number;

  @Column({
    type: 'enum',
    enum: VendorLocationStatus,
    default: VendorLocationStatus.INACTIVE,
  })
  status: VendorLocationStatus;

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
