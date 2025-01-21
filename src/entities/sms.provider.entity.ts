import { SMSProviderType } from 'src/enums/sms.providers.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sms_providers' })
export class SMSProviders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: '' })
  sender_id?: string;

  @Column({ nullable: false })
  sender_name: string;

  @Column({
    nullable: true,
  })
  from_number?: string;

  @Column({
    type: 'enum',
    enum: SMSProviderType,
  })
  provider: SMSProviderType;

  @Column({ nullable: false, default: '' })
  public_key?: string;

  @Column({ nullable: true, default: '' })
  private_key?: string;

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
