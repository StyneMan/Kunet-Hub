import { PaymentStatus } from 'src/enums/payment-status.enum';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', {
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  status: PaymentStatus;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  transactionNumber: string;

  @Column({ nullable: true })
  externalReferenceNumber?: string;

  @Column({ nullable: true })
  orderNumber?: string;

  @Column()
  userType: string;

  @Column()
  userId: string;

  @Column()
  gatewayI: number;

  @Column()
  returnUrl: string;
}
