import { PaymentGatewayType } from 'src/enums/payment.gateways.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'payment_gateways' })
export class PaymentGateway {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  logo: string;

  @Column({
    type: 'enum',
    enum: PaymentGatewayType,
  })
  provider: PaymentGatewayType;

  @Column({ nullable: false })
  secret_key: string;

  @Column({ nullable: false })
  public_key: string;

  @Column({ nullable: true })
  encryption?: string;

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
