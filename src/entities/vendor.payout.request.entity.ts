import { PayoutStatus } from 'src/enums/payout-status.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { VendorWallet } from './vendor.wallet.entity';
import { VendorBank } from './vendor.bank.entity';

@Entity({ name: 'vendor_payout_requests' })
export class VendorPayoutRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.SUBMITTED })
  status: PayoutStatus;

  @OneToOne(() => VendorBank, { nullable: false })
  @JoinColumn()
  bank_info: VendorBank;

  @OneToOne(() => VendorWallet, { nullable: false })
  @JoinColumn()
  wallet: VendorWallet;

  @OneToOne(() => Vendor, { nullable: false })
  @JoinColumn()
  vendor: Vendor;

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
