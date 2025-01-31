import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from 'src/enums/transaction.type.enum';
import { Order } from './order.entity';

@Entity({ name: 'system_transactions' })
export class SystemTransactions {
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

  @OneToOne(() => Order, {
    cascade: true,
    nullable: true,
  })
  order: Order;

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
