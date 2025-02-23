import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductStatus } from 'src/enums/product.status.enum';
import { VariationType } from 'src/enums/variation.type.enum';
import { VendorLocation } from './vendor.location.entity';
import { Vendor } from './vendor.entity';

export type ProdVariations = {
  price: number;
  name: string;
  value: string;
  variationType?: VariationType;
};

export type Specification = {
  name: string;
  value: string;
};

export type Ingredient = {
  name: string;
  value: string;
};

export type Addon = {
  name: string;
  price: number;
};

export type Nutrition = {
  carbs: number;
  fats: number;
  proteins: number;
  calories: number;
};

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid') // This will generate UUID automatically
  id: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Category)
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
  variations?: ProdVariations[];

  @Column({ type: 'json', nullable: true })
  specifications?: Specification[];

  @Column({ type: 'json', nullable: true })
  ingredients?: Ingredient[];

  @Column({ type: 'json', nullable: true })
  nutrition?: Nutrition;

  @Column({ type: 'json', nullable: true })
  addons?: Addon[];

  @Column({ type: 'json', nullable: false })
  images: string[];

  @ManyToOne(() => Vendor, {
    onDelete: 'CASCADE',
  })
  vendor: Vendor;

  @ManyToOne(() => VendorLocation, (location) => location.products, {
    onDelete: 'CASCADE',
  })
  vendor_location: VendorLocation;

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
