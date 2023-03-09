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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ObjectLiteral } from 'typeorm';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.updateOne(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.removeOne(id);
  }
}
