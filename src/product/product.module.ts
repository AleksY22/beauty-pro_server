import { Module } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
   imports: [UserModule],
   controllers: [ProductController],
   providers: [ProductService, PrismaService, FileService],
})
export class ProductModule {}
