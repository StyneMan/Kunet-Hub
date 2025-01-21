import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { Rider } from './rider.entity';

@Entity({ name: 'rider_transactions' })
export class RiderTransactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  transaction_type: TransactionType;

  @Column({ nullable: false, unique: true })
  tx_ref: string;

  @Column({ nullable: false })
  fee: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  summary: string;

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
