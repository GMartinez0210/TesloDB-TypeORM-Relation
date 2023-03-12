import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  url: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
