import { PayoutStatus } from 'src/enums/payout-status.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RiderBank } from './rider.bank.entity';
import { RiderWallet } from './rider.wallet.entity';
import { Rider } from './rider.entity';

@Entity({ name: 'rider_payout_requests' })
export class RiderPayoutRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.SUBMITTED })
  status: PayoutStatus;

  @ManyToOne(() => RiderBank, { nullable: false })
  @JoinColumn()
  bank_info: RiderBank;

  @ManyToOne(() => RiderWallet, { nullable: false })
  @JoinColumn()
  wallet: RiderWallet;

  @ManyToOne(() => Rider, { nullable: false })
  @JoinColumn()
  rider: Rider;

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
