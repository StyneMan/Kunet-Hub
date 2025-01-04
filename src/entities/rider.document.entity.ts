import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  // OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rider } from './rider.entity';

@Entity({ name: 'rider_documents' })
export class RiderDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  front_view: string;

  @Column({ nullable: true })
  back_view: string;

  @OneToOne(() => Rider)
  @JoinColumn()
  owner: Rider;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
