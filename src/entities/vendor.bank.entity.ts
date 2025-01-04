import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity({ name: 'vendor_banks' })
export class VendorBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  bank_name: string;

  @Column({ nullable: false })
  bank_code: string;

  @Column({ nullable: false })
  account_name: string;

  @Column({ nullable: false })
  account_number: string;

  @ManyToOne(() => Vendor)
  @JoinColumn()
  owner: Vendor;

  @Column({ nullable: false, default: false })
  is_default: boolean;

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
