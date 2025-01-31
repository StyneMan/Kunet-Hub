import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BikeType } from 'src/enums/bike.type.enum';
import { Color } from './color.entity';
import { Rider } from './rider.entity';

@Entity({ name: 'bikes' })
export class Bike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  make?: string;

  @Column({ nullable: true })
  model?: string;

  @OneToOne(() => Color)
  @JoinColumn()
  color: Color;

  @Column({ nullable: true })
  reg_number?: string;

  @Column({ nullable: true })
  year_of_manufacture?: string;

  @Column({ type: 'enum', enum: BikeType })
  type: BikeType;

  @ManyToOne(() => Rider, { nullable: true })
  @JoinColumn()
  rider: Rider;

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
