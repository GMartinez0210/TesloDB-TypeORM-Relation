import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product } from 'src/products/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
