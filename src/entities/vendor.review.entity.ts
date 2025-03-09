import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rider } from './rider.entity';
import { Customer } from './customer.entity';
import { VendorLocation } from './vendor.location.entity';

@Entity({ name: 'vendor_reviews' })
export class VendorReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ nullable: false })
  rating: number;

  @ManyToOne(() => VendorLocation)
  @JoinColumn()
  vendor_location: VendorLocation;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Rider)
  @JoinColumn()
  rider: Rider;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
