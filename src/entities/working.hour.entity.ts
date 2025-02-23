import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity({ name: 'work_hours' })
export class WorkHour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  mon_open?: string;

  @Column({ nullable: true })
  mon_close?: string;

  @Column({ nullable: true })
  tue_open?: string;

  @Column({ nullable: true })
  tue_close?: string;

  @Column({ nullable: true })
  wed_open?: string;

  @Column({ nullable: true })
  wed_close?: string;

  @Column({ nullable: true })
  thu_open?: string;

  @Column({ nullable: true })
  thu_close?: string;

  @Column({ nullable: true })
  fri_open?: string;

  @Column({ nullable: true })
  fri_close?: string;

  @Column({ nullable: true })
  sat_open?: string;

  @Column({ nullable: true })
  sat_close?: string;

  @Column({ nullable: true })
  sun_open?: string;

  @Column({ nullable: true })
  sun_close?: string;

  @OneToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

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
