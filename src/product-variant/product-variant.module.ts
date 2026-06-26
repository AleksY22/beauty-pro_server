import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantService } from './product-variant.service';

@Module({
   controllers: [ProductVariantController],
   providers: [ProductVariantService, PrismaService, UserService],
})
export class ProductVariantModule {}
