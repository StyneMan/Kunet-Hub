import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'admin_wallet' })
export class AdminWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 0.0 })
  balance: number;

  @Column({ nullable: false, default: 0.0 })
  prev_balance: number;

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
