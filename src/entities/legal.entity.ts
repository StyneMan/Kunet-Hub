import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'legals' })
export class Legal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'longtext', nullable: true })
  privacy: string;

  @Column({ type: 'longtext', nullable: true })
  terms: string;

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
