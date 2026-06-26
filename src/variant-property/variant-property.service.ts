import {
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import {
   CreateVariantPropertyDto,
   UpdateVariantPropertyDto,
} from './dto/variant-property.dto';

@Injectable()
export class VariantPropertyService {
   constructor(private prisma: PrismaService) {}

   // 1. Получить все свойства конкретного варианта товара
   async getByVariantId(variantId: string) {
      return this.prisma.variantProperty.findMany({
         where: { variantId },
         include: {
            attribute: true, // Сразу подтягиваем название
         },
      });
   }

   // 2. Создать точечное свойство для варианта
   async create(dto: CreateVariantPropertyDto) {
      try {
         return await this.prisma.variantProperty.create({
            data: {
               value: dto.value,
               variantId: dto.variantId,
               attributeId: dto.attributeId,
            },
            include: { attribute: true },
         });
      } catch (error: unknown) {
         // Перехват ошибки уникальности составного ключа @@unique([variantId, attributeId])
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
         ) {
            throw new ConflictException(
               'У этого варианта товара уже задано значение для данного атрибута!',
            );
         }
         throw error;
      }
   }

   // 3. Обновить только значение свойства (например, изменили с "L" на "XL")
   async update(id: string, dto: UpdateVariantPropertyDto) {
      try {
         return await this.prisma.variantProperty.update({
            where: { id },
            data: { value: dto.value },
            include: { attribute: true },
         });
      } catch (error: unknown) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
         ) {
            throw new NotFoundException(
               'Свойство варианта не найдено для обновления!',
            );
         }
         throw error;
      }
   }

   // 4. Удалить свойство у варианта
   async delete(id: string) {
      try {
         return await this.prisma.variantProperty.delete({
            where: { id },
         });
      } catch (error: unknown) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
         ) {
            throw new NotFoundException(
               'Свойство варианта не найдено для удаления!',
            );
         }
         throw error;
      }
   }
}
