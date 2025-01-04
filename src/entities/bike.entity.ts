import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BikeType } from 'src/enums/bike.type.enum';

@Entity({ name: 'bikes' })
export class Bike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  make: string;

  @Column({ nullable: false })
  model: string;

  @Column({ nullable: false })
  color: string;

  @Column({ nullable: false })
  reg_number: string;

  @Column({ nullable: false })
  year_of_manufacture: string;

  @Column({ type: 'enum', enum: BikeType })
  type: BikeType;

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
