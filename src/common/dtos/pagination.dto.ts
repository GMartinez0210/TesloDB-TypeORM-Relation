import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  offset: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  limit: number;
}
