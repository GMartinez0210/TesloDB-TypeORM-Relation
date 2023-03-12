import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities';

import { DataSource, InsertResult, QueryRunner, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { initialData } from './data/seed-product.data';
import { ISeedRestoreResponse } from './interfaces/response.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async restore() {
    const response: ISeedRestoreResponse = {} as ISeedRestoreResponse;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productsInsertResult = await this.productRestore();

      response.product = productsInsertResult.generatedMaps.length;

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      console.log('Error | restore | seed service');
      throw new InternalServerErrorException({ error });
    }

    return response;
  }

  private async productRestore(): Promise<InsertResult> {
    await this.productRepository.delete({});

    const products = initialData.products as QueryDeepPartialEntity<Product>[];
    const insertResult: InsertResult = await this.productRepository.insert(
      products,
    );

    return insertResult;
  }
}
