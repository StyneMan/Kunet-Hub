import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  // OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Operator } from './operator.entity';

@Entity({ name: 'operator_documents' })
export class OperatorDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  front_view: string;

  @Column({ nullable: true })
  back_view: string;

  @OneToOne(() => Operator)
  @JoinColumn()
  owner: Operator;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
