import { ReporteeType } from 'src/enums/reportee.type.enum';
import { UserType } from 'src/enums/user.type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'complaints' })
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  reporter_id: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  reporter_type: UserType;

  @Column({ nullable: false })
  reportee_id: string;

  @Column({
    type: 'enum',
    enum: ReporteeType,
    nullable: false,
  })
  reportee_type: ReporteeType;

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
