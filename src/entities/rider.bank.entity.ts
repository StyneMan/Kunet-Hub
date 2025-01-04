import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rider } from './rider.entity';

@Entity({ name: 'rider_banks' })
export class RiderBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  bank_name: string;

  @Column({ nullable: false })
  bank_code: string;

  @Column({ nullable: false })
  bank_logo: string;

  @Column({ nullable: false })
  account_name: string;

  @Column({ nullable: false })
  account_number: string;

  @Column({ nullable: true })
  recipient_code?: string;

  @Column({ nullable: true })
  beneficiary?: string;

  @OneToOne(() => Rider)
  @JoinColumn()
  owner: Rider;

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
