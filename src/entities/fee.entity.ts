import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'commissions_fees' })
export class CommissionAndFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 1.0 })
  rider_order_cancellation: number;

  @Column({ nullable: false, default: 1.0 })
  vendor_order_cancellation: number;

  @Column({ nullable: false, default: 1.0 })
  service_charge: number;

  @Column({ nullable: false, default: 1.0 })
  rider_withdrawal_fee: number;

  @Column({ nullable: false, default: 1.0 })
  vendor_withdrawal_fee: number;

  @Column({ nullable: false, default: 1.0 })
  rider_commission_per_km: number;

  @Column({ nullable: false, default: 1.0 })
  delivery_charge_per_km: number;

  @Column({ nullable: false, default: 1.0 })
  delivery_charge_per_kg: number;

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
