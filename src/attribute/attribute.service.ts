import {
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { AttributeDto } from './dto/attribute.dto';

@Injectable()
export class AttributeService {
   constructor(private prisma: PrismaService) {}

   // 1. Получить все атрибуты
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [attributes, totalCount] = await Promise.all([
         this.prisma.attribute.findMany({
            skip,
            take,
            include: {
               _count: {
                  select: { variantProperties: true },
               },
            },
            orderBy: { name: 'asc' },
         }),
         this.prisma.attribute.count(),
      ]);

      return {
         attributes,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // 2. Получить один атрибут по ID
   async getById(id: string) {
      const attribute = await this.prisma.attribute.findUnique({
         where: { id },
      });

      if (!attribute) {
         throw new NotFoundException(`Атрибут с ID "${id}" не найден!`);
      }

      return attribute;
   }

   // 3. Создать новый атрибут
   async create(dto: AttributeDto) {
      try {
         return await this.prisma.attribute.create({
            data: {
               name: dto.name,
            },
         });
      } catch (error: unknown) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
         ) {
            throw new ConflictException(
               `Атрибут с названием "${dto.name}" уже существует!`,
            );
         }
         throw error;
      }
   }

   // 4. Обновить название атрибута
   async update(id: string, dto: AttributeDto) {
      try {
         return await this.prisma.attribute.update({
            where: { id },
            data: {
               name: dto.name,
            },
         });
      } catch (error: unknown) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
               throw new NotFoundException('Атрибут для обновления не найден!');
            }
            if (error.code === 'P2002') {
               throw new ConflictException(
                  `Атрибут с названием "${dto.name}" уже существует!`,
               );
            }
         }
         throw error;
      }
   }

   // 5. Удалить атрибут
   async delete(id: string) {
      try {
         return await this.prisma.attribute.delete({
            where: { id },
         });
      } catch (error: unknown) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
               throw new NotFoundException('Атрибут для удаления не найден!');
            }
            // Обработка ограничения Restrict (запрет удаления используемого атрибута)
            if (error.code === 'P2003') {
               throw new ConflictException(
                  'Нельзя удалить этот атрибут, так как он привязан к существующим вариантам товаров! Сначала удалите свойства вариантов.',
               );
            }
         }
         throw error;
      }
   }
}
