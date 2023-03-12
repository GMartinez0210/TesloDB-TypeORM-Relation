import { QueryRunner } from 'typeorm';
import { Product } from '../entities';

export interface IParamsForGetNewProductImages {
  id: string;
  product: Product;
  productImages: string[];
  queryRunner: QueryRunner;
}

export interface IParamsForGetProductImages {
  id: string;
}
