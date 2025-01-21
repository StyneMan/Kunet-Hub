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
import { Customer } from './customer.entity';

@Entity({ name: 'customer_transactions' })
export class CustomerTransactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  transaction_type: TransactionType;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  summary: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn()
  customer: Customer;

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
