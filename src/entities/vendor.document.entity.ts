import {
  Column,
  Entity,
  ManyToOne,
  // OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity({ name: 'vendor_documents' })
export class VendorDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  front_view: string;

  @Column({ nullable: true })
  back_view: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.documents, {
    onDelete: 'CASCADE',
  })
  owner: Vendor;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
