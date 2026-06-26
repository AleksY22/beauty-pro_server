import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
   constructor(private prisma: PrismaService) {}

   // Для чекаута: Получение ВСЕХ активных методов оплаты без пагинации
   async getAvailable() {
      return this.prisma.paymentMethod.findMany({
         where: { isEnabled: true },
         orderBy: { name: 'asc' },
      });
   }

   // Получение всех методов оплаты
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [payments, totalCount] = await Promise.all([
         this.prisma.paymentMethod.findMany({
            skip,
            take,
            orderBy: { name: 'desc' },
         }),
         this.prisma.paymentMethod.count(),
      ]);

      return {
         payments,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // Получение метода оплаты по id
   async getById(paymentId: string) {
      const payment = await this.prisma.paymentMethod.findUnique({
         where: {
            id: paymentId,
         },
      });

      if (!payment) throw new NotFoundException('Метод оплаты не найден!');

      return payment;
   }

   // Создание метода оплаты
   async create(dto: PaymentDto) {
      return this.prisma.paymentMethod.create({
         data: {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            isEnabled: dto.isEnabled,
            instruction: dto?.instruction,
         },
      });
   }

   // Обновление метода оплаты
   async update(paymentId: string, dto: PaymentDto) {
      await this.getById(paymentId);

      return this.prisma.paymentMethod.update({
         where: {
            id: paymentId,
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

   // Удаление метода оплаты
   async delete(paymentId: string) {
      await this.getById(paymentId);

      return this.prisma.paymentMethod.delete({
         where: {
            id: paymentId,
         },
      });
   }
}
