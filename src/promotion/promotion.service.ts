import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { PromotionDto } from './dto/promotion.dto';

@Injectable()
export class PromotionService {
   constructor(
      private prisma: PrismaService,
      private readonly fileService: FileService,
   ) {}

   //Получение всех акций для магазина==================
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [promotions, totalCount] = await Promise.all([
         this.prisma.promotion.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
         }),
         this.prisma.promotion.count(),
      ]);

      return {
         promotions,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение акции по id===============================
   async getById(promotionId: string) {
      const promotion = await this.prisma.promotion.findUnique({
         where: {
            id: promotionId,
         },
      });

      if (!promotion) throw new NotFoundException('Акция не найдена!');

      return promotion;
   }

   //Создание акции======================================
   async create(dto: PromotionDto) {
      return this.prisma.promotion.create({
         data: {
            title: dto.title,
            date: dto.date,
            image: dto.image,
         },
      });
   }

   //Обновление акции=====================================
   async update(promotionId: string, dto: PromotionDto) {
      await this.getById(promotionId);

      return this.prisma.promotion.update({
         where: {
            id: promotionId,
         },
         data: {
            title: dto.title,
            date: dto.date,
            image: dto.image,
         },
      });
   }

   //Удаление акции========================================
   async delete(promotionId: string) {
      const promotion = await this.getById(promotionId);

      //удаление картинки из blob vercel
      if (promotion && promotion.image) {
         await this.fileService.deleteFiles(promotion.image);
      }

      return this.prisma.promotion.delete({
         where: {
            id: promotionId,
         },
      });
   }
}
