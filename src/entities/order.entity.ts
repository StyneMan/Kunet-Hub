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
import { Rider } from './rider.entity';
import OrderItemI from 'src/interfaces/order.item';
import { OrderType } from 'src/enums/order.type.enum';
import { Operator } from './operator.entity';
import { OrderStatus } from 'src/enums/order.status.enum';
import { ReceiverI } from 'src/commons/interfaces/receiver.interface';
import { ShippingType } from 'src/enums/shipping.type.enum';
import { DeliveryType } from 'src/enums/delivery.type.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { VendorLocation } from './vendor.location.entity';
import { Vendor } from './vendor.entity';
import { Addon, ProdVariations } from './product.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  order_id: string;

  @Column({ nullable: false })
  total_amount: number;

  @Column({ nullable: true })
  vendor_note?: string;

  @Column({ nullable: true })
  rider_note?: string;

  @Column({ nullable: false })
  access_code: string;

  @Column({ nullable: true })
  delivery_fee?: number;

  @Column({ nullable: false, default: 100 })
  service_charge: number;

  @Column({ nullable: false, default: 0 })
  coupon_discount: number;

  @Column({ nullable: true })
  delivery_time: string;

  @Column({ nullable: true })
  rider_commission?: number;

  @Column({ nullable: true })
  pickup_address?: string;

  @Column({ nullable: true })
  pickup_addr_lat?: string;

  @Column({ nullable: true })
  pickup_addr_lng?: string;

  @Column({ nullable: true })
  delivery_address?: string;

  @Column({ nullable: true })
  delivery_addr_lat?: string;

  @Column({ nullable: true })
  delivery_addr_lng?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({ type: 'json', nullable: false })
  items: OrderItemI[];

  @Column({ type: 'json', nullable: true })
  receiver?: ReceiverI;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn()
  customer?: Customer;

  @ManyToOne(() => Operator, { nullable: true })
  @JoinColumn()
  operator?: Operator;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn()
  vendor?: Vendor;

  @ManyToOne(() => VendorLocation, { nullable: true })
  @JoinColumn()
  vendor_location?: VendorLocation;

  @ManyToOne(() => Rider, { nullable: true })
  @JoinColumn()
  rider: Rider;

  @Column({ type: 'enum', enum: OrderType, nullable: false })
  order_type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, nullable: false })
  order_status: OrderStatus;

  @Column({ type: 'enum', enum: ShippingType, nullable: true })
  shipping_type?: ShippingType;

  @Column({ type: 'enum', enum: DeliveryType, nullable: false })
  delivery_type: DeliveryType;

  @Column({ type: 'json', nullable: true })
  variations?: ProdVariations[];

  @Column({ type: 'json', nullable: true })
  addOns?: Addon[];

  @Column({ type: 'timestamp', nullable: true, default: null })
  order_delivered_at?: Date | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  paid_at?: Date | null;

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
