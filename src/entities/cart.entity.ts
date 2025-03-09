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
import { Customer } from './customer.entity';
import { Vendor } from './vendor.entity';
import { CartItem } from './cart.item.entity';
import { Transform } from 'class-transformer';
import { VendorLocation } from './vendor.location.entity';

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  total_amount: number;

  @Column({ nullable: true, default: '' })
  vendor_note?: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true, // Automatically persist CartItems with Cart
    eager: true,
  })
  @Transform(({ value }) => value.map((item) => ({ ...item, cart: undefined }))) // Break circular reference
  items: CartItem[];

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @ManyToOne(() => VendorLocation, {
    onDelete: 'CASCADE',
  })
  vendor_location: VendorLocation;

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
