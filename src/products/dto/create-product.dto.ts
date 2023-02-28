import {
  IsString,
  MinLength,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsInt,
} from 'class-validator';
import { IsIn } from 'class-validator/types/decorator/decorators';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  stock: number;

  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsString()
  @IsIn(['men', 'women', 'kids', 'unisex'])
  gender: string;
}
