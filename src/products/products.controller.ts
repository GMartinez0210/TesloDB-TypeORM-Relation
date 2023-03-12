import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createOne(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createOne(createProductDto);
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return await this.productsService.findAll(pagination);
  }

  @Get('search')
  async findOne(
    @Query('id') id: string,
    @Query('slug') slug: string,
    @Query('title') title: string,
  ) {
    if (id) {
      return await this.productsService.findOneById(id);
    }

    slug ||= '';
    title ||= '';
    const query: ObjectLiteral = { slug, title };
    return await this.productsService.findOne(query);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.findOneById(id);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.updateOne(id, updateProductDto);
  }

  @Delete(':id')
  async removeOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.removeOne(id);
  }
}
