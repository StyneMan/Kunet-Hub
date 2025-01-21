import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity({ name: 'shipping_addresses' })
export class ShippingAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  locality: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ nullable: true })
  address_as: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: false, default: false })
  is_default: boolean;

  @ManyToOne(() => Customer)
  @JoinColumn()
  user: Customer;

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
