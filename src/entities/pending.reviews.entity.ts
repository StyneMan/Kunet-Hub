import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Rider } from './rider.entity';
import { RevieweeType, ReviewerType } from 'src/enums/reviewer.type.enum';
import { VendorLocation } from './vendor.location.entity';

@Entity({ name: 'pending_reviews' })
export class PendingReviews {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  customer?: Customer;

  @ManyToOne(() => Rider)
  rider?: Rider;

  @Column({ nullable: false })
  reviewee_id: string;

  @Column({ type: 'enum', enum: ReviewerType })
  reviewer_type: ReviewerType;

  @Column({ type: 'enum', enum: RevieweeType })
  reviewee_type: RevieweeType;

  @ManyToOne(() => Rider)
  riderReviewee?: Rider;

  @ManyToOne(() => VendorLocation)
  vendorReviewee?: VendorLocation;

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
