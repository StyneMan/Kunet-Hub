import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'platform_settings' })
export class PlatformSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logistics_phone_number?: string;

  @Column({ nullable: true })
  contact_phone?: string;

  @Column({ nullable: true })
  contact_email?: string;

  @Column({ nullable: true })
  support_email?: string;

  @Column({ nullable: true })
  head_office?: string;

  @Column({ nullable: true })
  brand_logo?: string;

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
