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
import { Variation } from './variations.entity';
import { Category } from './category.entity';
import { ProductStatus } from 'src/enums/product.status.enum';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid') // This will generate UUID automatically
  id: string;

  @Column({ nullable: false })
  name: string;

  @OneToOne(() => Category)
  @JoinColumn()
  category: Category;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  sale_amount: number;

  @Column({ nullable: false })
  discount_amount: number;

  @Column({ nullable: false })
  discount_percent: string;

  @Column({ nullable: false })
  is_variable: boolean;

  @Column({ nullable: false, default: 1.0 })
  rating: number;

  @Column({ type: 'json', nullable: true })
  variations?: Variation[];

  @Column({ type: 'json', nullable: false })
  images: string[];

  @OneToOne(() => Vendor)
  @JoinColumn()
  vendor: Vendor;

  @Column({
    type: 'enum',
    enum: [ProductStatus.ACTIVE, ProductStatus.DELETED, ProductStatus.HIDDEN],
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

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
