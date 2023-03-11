import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, DeepPartial, ObjectLiteral, Repository } from 'typeorm';

import { Product, ProductImage } from './entities';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {
  IParamsForGetNewProductImages,
  IParamsForGetProductImages,
} from './interface/params.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images: productImages } = createProductDto;

      const images = productImages.map((url) =>
        this.productImageRepository.create({ url }),
      );

      const productInstance = {
        ...createProductDto,
        images,
      };

      const product = this.productRepository.create(productInstance);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      console.log('Error | create | product service');
      throw new InternalServerErrorException({ error });
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      const { offset: skip, limit: take = 5 } = pagination;
      const products = await this.productRepository.find({
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

  async findOne(query: ObjectLiteral) {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
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

  async findOneById(id: string) {
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

  async updateOne(id: string, updateProductDto: UpdateProductDto) {
    try {
      const { images: productImages, ...spreadUpdateProductDto } =
        updateProductDto;

      const productInstancePreload = {
        ...spreadUpdateProductDto,
        id,
      };

      const product = await this.productRepository.preload(
        productInstancePreload,
      );

      if (!product) {
        throw new NotFoundException({
          error: `The product with ID: ${id} was not found`,
        });
      }

      const queryRunner = this.dataSource.createQueryRunner();
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

  async removeOne(id: string) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });

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

  async getNewProductImages(
    params: IParamsForGetNewProductImages,
  ): Promise<ProductImage[]> {
    const { id, queryRunner, productImages } = params;

    await queryRunner.manager.delete(ProductImage, { product: { id } });

    const images = productImages.map((url) =>
      this.productImageRepository.create({ url }),
    );

    return images;
  }

  async getProductImages(
    params: IParamsForGetProductImages,
  ): Promise<ProductImage[]> {
    const { id } = params;

    const images = await this.productImageRepository.find({
      where: { product: { id } },
    });

    return images;
  }
}
