import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { VariantPropertyController } from './variant-property.controller';
import { VariantPropertyService } from './variant-property.service';

@Module({
   controllers: [VariantPropertyController],
   providers: [VariantPropertyService, PrismaService],
})
export class VariantPropertyModule {}
