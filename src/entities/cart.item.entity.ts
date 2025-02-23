import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Addon, Product, ProdVariations } from './product.entity';
import SelectionItemI from 'src/interfaces/selection.item';
import { Exclude } from 'class-transformer';

@Entity({ name: 'cart_items' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Exclude()
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn()
  product: Product;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  total_amount: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'json', nullable: true })
  extras?: SelectionItemI[];

  @Column({ type: 'json', nullable: true })
  addOns?: Addon[];

  @Column({ type: 'json', nullable: true })
  variations?: ProdVariations[];

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
