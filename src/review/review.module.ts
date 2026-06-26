import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
   imports: [UserModule],
   controllers: [ReviewController],
   providers: [ReviewService, PrismaService],
})
export class ReviewModule {}
