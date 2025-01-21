import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Vendor } from './vendor.entity';
import { Rider } from './rider.entity';
import OrderItemI from 'src/interfaces/order.item';
import { OrderType } from 'src/enums/order.type.enum';
import { Operator } from './operator.entity';
import { OrderStatus } from 'src/enums/order.status.enum';
import { ReceiverI } from 'src/commons/interfaces/receiver.interface';
import { ShippingType } from 'src/enums/shipping.type.enum';
import { DeliveryType } from 'src/enums/delivery.type.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  order_id: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ type: 'json', nullable: false })
  items: OrderItemI[];

  @Column({ type: 'json', nullable: true })
  receiver?: ReceiverI;

  @OneToOne(() => Customer, { nullable: true })
  @JoinColumn()
  customer?: Customer;

  @OneToOne(() => Operator, { nullable: true })
  @JoinColumn()
  operator?: Operator;

  @OneToOne(() => Vendor, { nullable: true })
  @JoinColumn()
  vendor?: Vendor;

  @OneToOne(() => Rider, { nullable: true })
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
