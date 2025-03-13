import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminNotificationType } from 'src/enums/vendor.notification.type.enum';
import { Admin } from './admin.entity';

@Entity({ name: 'admin_notifications' })
export class AdminNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: AdminNotificationType, nullable: false })
  notification_type: AdminNotificationType;

  @ManyToOne(() => Admin)
  @JoinColumn()
  admin: Admin;

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
