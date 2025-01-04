import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VariationType } from 'src/enums/variation.type.enum';
import { Color } from './color.entity';
import { Size } from './size.entity';

@Entity({ name: 'variations' })
export class Variation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Color)
  @JoinColumn()
  color?: Color;

  @OneToOne(() => Size)
  @JoinColumn()
  size?: Size;

  @Column({ type: 'enum', enum: VariationType })
  type: VariationType;

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
