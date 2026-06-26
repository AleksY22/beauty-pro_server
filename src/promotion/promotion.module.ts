import { Module } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';

@Module({
   imports: [UserModule],
   controllers: [PromotionController],
   providers: [PromotionService, PrismaService, FileService],
})
export class PromotionModule {}
