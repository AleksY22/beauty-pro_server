import { Module } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
   imports: [UserModule],
   controllers: [CategoryController],
   providers: [CategoryService, PrismaService, FileService],
})
export class CategoryModule {}
