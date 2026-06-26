import { Module } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';

@Module({
   imports: [UserModule],
   controllers: [AdvertisementController],
   providers: [AdvertisementService, PrismaService, FileService],
})
export class AdvertisementModule {}
