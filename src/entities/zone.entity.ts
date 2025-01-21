import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity({ name: 'zones' })
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
    default: '',
  })
  region: string;

  @Column({
    type: 'geometry', // Using the MySQL `geometry` type to store spatial data
    spatialFeatureType: 'Polygon',
    srid: 4326, // Spatial Reference System Identifier (WGS 84)
  })
  @Index({ spatial: true }) // Create a spatial index for faster spatial queries
  boundary: string; // The polygon that represents the zone's geographical area

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

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
