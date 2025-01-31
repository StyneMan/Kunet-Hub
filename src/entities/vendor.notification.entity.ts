import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rider } from './rider.entity';
import { Vendor } from './vendor.entity';
import { Order } from './order.entity';
import { VendorNotificationType } from 'src/enums/vendor.notification.type.enum';

@Entity({ name: 'vendor_notifications' })
export class VendorNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: VendorNotificationType, nullable: false })
  notification_type: VendorNotificationType;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @ManyToOne(() => Order)
  @JoinColumn()
  order?: Order;

  @OneToOne(() => Rider)
  @JoinColumn()
  rider?: Rider;

  @Column({ nullable: false, default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
