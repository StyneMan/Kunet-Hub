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
import { Exclude } from 'class-transformer';

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
  @Exclude()
  items: CartItem[];

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

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
