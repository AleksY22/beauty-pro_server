import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DeliveryDto } from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
   constructor(private prisma: PrismaService) {}

   // Для чекаута: Получение ВСЕХ активных методов доставки без пагинации
   async getAvailable() {
      return this.prisma.deliveryMethod.findMany({
         where: { isEnabled: true },
         orderBy: { name: 'asc' }, // Изменено на asc (от А до Я удобнее для пользователей)
      });
   }

   // Получение всех методов доставки
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [deliveries, totalCount] = await Promise.all([
         this.prisma.deliveryMethod.findMany({
            skip,
            take,
            orderBy: { name: 'desc' },
         }),
         this.prisma.deliveryMethod.count(),
      ]);

      return {
         deliveries,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // Получение метода доставки по id
   async getById(deliveryId: string) {
      const delivery = await this.prisma.deliveryMethod.findUnique({
         where: {
            id: deliveryId,
         },
      });

      if (!delivery) throw new NotFoundException('Метод доставки не найден!');

      return delivery;
   }

   // Создание метода доставки
   async create(dto: DeliveryDto) {
      return this.prisma.deliveryMethod.create({
         data: {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            isEnabled: dto.isEnabled,
            instruction: dto?.instruction,
         },
      });
   }

   // Обновление метода доставки
   async update(deliveryId: string, dto: DeliveryDto) {
      await this.getById(deliveryId);

      return this.prisma.deliveryMethod.update({
         where: {
            id: deliveryId,
         },
         data: {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            isEnabled: dto.isEnabled,
            instruction: dto?.instruction,
         },
      });
   }

   // Удаление метода доставки
   async delete(deliveryId: string) {
      await this.getById(deliveryId);

      return this.prisma.deliveryMethod.delete({
         where: {
            id: deliveryId,
         },
      });
   }
}
