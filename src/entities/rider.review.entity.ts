import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rider } from './rider.entity';
import { Customer } from './customer.entity';

@Entity({ name: 'rider_reviews' })
export class RiderReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ nullable: false })
  rating: number;

  @ManyToOne(() => Rider)
  @JoinColumn()
  rider: Rider;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
