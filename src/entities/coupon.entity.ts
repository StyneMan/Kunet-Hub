import { DiscountType } from 'src/enums/discount.type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { Customer } from './customer.entity';
import { CouponStatus } from 'src/enums/coupon.status.enum';

@Entity({ name: 'coupons' })
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: false, unique: false })
  code: string;

  @Column({ nullable: false })
  discount: number;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @Column({ type: 'enum', enum: DiscountType, nullable: false })
  discount_type: DiscountType;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.INACTIVE,
    nullable: false,
  })
  coupon_status: CouponStatus;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @ManyToMany(() => Customer, (customer) => customer.coupons)
  @JoinTable() // Add this to define the join table
  customers: Customer[];

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
