import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  DeepPartial,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { Product, ProductImage } from './entities';

import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import {
  IParamsForGetNewProductImages,
  IParamsForGetProductImages,
} from './interfaces/params.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async createOne(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { images: productImages } = createProductDto;

      const images: ProductImage[] = productImages.map((url) =>
        this.productImageRepository.create({ url }),
      );

      const productInstance: DeepPartial<Product> = {
        ...createProductDto,
        images,
      };

      const product: Product = this.productRepository.create(productInstance);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      console.log('Error | create | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async findAll(pagination: PaginationDto): Promise<Product[]> {
    try {
      const { offset: skip, limit: take = 5 } = pagination;
      const products: Product[] = await this.productRepository.find({
        skip,
        take,
        relations: {
          images: true,
        },
      });

      return products;
    } catch (error) {
      console.log('Error | findAll | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async findOne(query: ObjectLiteral): Promise<Product> {
    try {
      const queryBuilder: SelectQueryBuilder<Product> =
        this.productRepository.createQueryBuilder('product');
      queryBuilder.where('UPPER(product.title) = :title', {
        title: query.title.toUpperCase(),
      });
      queryBuilder.orWhere('UPPER(product.slug) = :slug', {
        slug: query.slug.toUpperCase(),
      });
      queryBuilder.innerJoinAndSelect('product.images', 'images');

      const product = await queryBuilder.getOne();

      if (!product) {
        throw new NotFoundException({
          error: 'The product was not found',
          query,
        });
      }

      return product;
    } catch (error) {
      console.log('Error | findOne | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async findOneById(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: {
          images: true,
        },
      });

      if (!product) {
        throw new NotFoundException({
          error: `The product with ID: ${id} was not found`,
        });
      }

      return product;
    } catch (error) {
      console.log('Error | findOneById | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async updateOne(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const { images: productImages, ...spreadUpdateProductDto } =
        updateProductDto;

      const productInstancePreload: DeepPartial<Product> = {
        ...spreadUpdateProductDto,
        id,
      };

      const product: Product = await this.productRepository.preload(
        productInstancePreload,
      );

      if (!product) {
        throw new NotFoundException({
          error: `The product with ID: ${id} was not found`,
        });
      }

      const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const paramsForGetNewProductImages: IParamsForGetNewProductImages = {
          id,
          product,
          queryRunner,
          productImages,
        };

        const paramsForGetProductImages: IParamsForGetProductImages = {
          id,
        };

        product.images = productImages
          ? await this.getNewProductImages(paramsForGetNewProductImages)
          : await this.getProductImages(paramsForGetProductImages);

        await queryRunner.manager.save(product);
        await queryRunner.commitTransaction();
        await queryRunner.release();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      return product;
    } catch (error) {
      console.log('Error | update | product service');
      throw new InternalServerErrorException({ error });
    }

    // * The code below not check if the product is in the database
    // * So if it's found, it'll be updated
    // * Also it doesn't apply for the @BeforeUpdate() decorator
    /*
    try {
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFoundException({
          error: `The product with ID: ${id} was not found`,
        });
      }

      await this.productRepository.update({ id }, updateProductDto);
      const productUpdated = await this.productRepository.findOne({
        where: { id },
      });

      return productUpdated;
    } catch (error) {
      console.log('Error | update | product service');
      throw new InternalServerErrorException({ error });
    }
    */
  }

  async removeOne(id: string): Promise<Product> {
    try {
      const product: Product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException({
          error: `The product with ID: ${id} was not found`,
        });
      }

      await this.productRepository.delete({ id });

      return product;
    } catch (error) {
      console.log('Error | create | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async removeAll(): Promise<void> {
    const queryBuilder: SelectQueryBuilder<Product> =
      this.productRepository.createQueryBuilder('product');
    queryBuilder.where({});
    queryBuilder.delete();

    await queryBuilder.execute();
  }

  private async getNewProductImages(
    params: IParamsForGetNewProductImages,
  ): Promise<ProductImage[]> {
    const { id, queryRunner, productImages } = params;

    await queryRunner.manager.delete(ProductImage, { product: { id } });

    const images: ProductImage[] = productImages.map((url) =>
      this.productImageRepository.create({ url }),
    );

    return images;
  }

  private async getProductImages(
    params: IParamsForGetProductImages,
  ): Promise<ProductImage[]> {
    const { id } = params;

    const images: ProductImage[] = await this.productImageRepository.find({
      where: { product: { id } },
    });

    return images;
  }
}
