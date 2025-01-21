import { SupportStatus } from 'src/enums/support.status.enum';
import { SupportType } from 'src/enums/support.type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'supports' })
export class Support {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: true })
  email_address?: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({
    type: 'enum',
    enum: SupportType,
    nullable: false,
  })
  support_type: SupportType;

  @Column({
    type: 'enum',
    enum: SupportStatus,
    nullable: false,
    default: SupportStatus.SUBMITTED,
  })
  ticket_status: SupportStatus;

  @Column({ nullable: false })
  ticket_no: string;

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
