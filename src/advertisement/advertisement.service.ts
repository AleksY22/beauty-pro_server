import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { AdvertisementDto } from './dto/advertisement.dto';

@Injectable()
export class AdvertisementService {
   constructor(
      private prisma: PrismaService,
      private readonly fileService: FileService,
   ) {}

   //Получение всех реклам для магазина==================
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [advertisements, totalCount] = await Promise.all([
         this.prisma.advertisement.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
         }),
         this.prisma.advertisement.count(),
      ]);

      return {
         advertisements,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение рекламы по id===============================
   async getById(advertisementId: string) {
      const advertisement = await this.prisma.advertisement.findUnique({
         where: {
            id: advertisementId,
         },
      });

      if (!advertisement) throw new NotFoundException('Реклама не найдена!');

      return advertisement;
   }

   //Создание рекламы======================================
   async create(dto: AdvertisementDto) {
      return this.prisma.advertisement.create({
         data: {
            title: dto.title,
            image: dto.image,
         },
      });
   }

   //Обновление рекламы=====================================
   async update(advertisementId: string, dto: AdvertisementDto) {
      await this.getById(advertisementId);

      return this.prisma.advertisement.update({
         where: {
            id: advertisementId,
         },
         data: {
            title: dto.title,
            image: dto.image,
         },
      });
   }

   //Удаление рекламы========================================
   async delete(advertisementId: string) {
      const advertisement = await this.getById(advertisementId);

      //удаление картинки из blob vercel
      if (advertisement && advertisement.image) {
         await this.fileService.deleteFiles(advertisement.image);
      }

      return this.prisma.advertisement.delete({
         where: {
            id: advertisementId,
         },
      });
   }
}
