import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ColorDto } from './dto/color.dto';

@Injectable()
export class ColorService {
   constructor(private prisma: PrismaService) {}

   //Получение цветов для магазина======================
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [colors, totalCount] = await Promise.all([
         this.prisma.color.findMany({
            skip,
            take,
         }),
         this.prisma.color.count(),
      ]);
      return {
         colors,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение цвета по id===============================
   async getById(colorId: string) {
      const color = await this.prisma.color.findUnique({
         where: {
            id: colorId,
         },
      });

      if (!color) throw new NotFoundException('Цвет не найден!');

      return color;
   }

   //Создание цвета========================================
   async create(dto: ColorDto) {
      return this.prisma.color.create({
         data: {
            name: dto.name,
            value: dto.value,
         },
      });
   }

   //Обновление цвета=======================================
   async update(colorId: string, dto: ColorDto) {
      await this.getById(colorId); //для проверки наличия цвета

      return this.prisma.color.update({
         where: {
            id: colorId,
         },
         data: {
            name: dto.name,
            value: dto.value,
         },
      });
   }

   //Удаление цвета===========================================
   async delete(colorId: string) {
      await this.getById(colorId); //для проверки наличия цвета

      return this.prisma.color.delete({
         where: {
            id: colorId,
         },
      });
   }
}
