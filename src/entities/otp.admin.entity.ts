import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity({ name: 'admin_otps' })
export class AdminOTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Admin)
  @JoinColumn()
  user: Admin;

  @Column({ nullable: false })
  code: string;

  @Column({ default: false })
  expired: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date; // New column to store expiration time

  @BeforeInsert()
  setExpirationDate() {
    this.expires_at = new Date(Date.now() + 10 * 60 * 1000); // Set expiration to 10 minutes from now
    this.updated_at = new Date();
  }

  @BeforeUpdate()
  updateAgain() {
    this.updated_at = new Date();
  }
}
