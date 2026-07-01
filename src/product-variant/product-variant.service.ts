import {
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { ProductVariantDto } from './dto/product-variant.dto';

@Injectable()
export class ProductVariantService {
   constructor(private prisma: PrismaService) {}

   async create(productId: string, dto: ProductVariantDto) {
      // 1. Проверяем, существует ли сам товар
      const productExists = await this.prisma.product.findUnique({
         where: { id: productId },
      });
      if (!productExists) {
         throw new NotFoundException(`Товар с ID ${productId} не найден!`);
      }

      // 2. Если передан colorId, проверяем существование цвета
      if (dto.colorId) {
         const colorExists = await this.prisma.color.findUnique({
            where: { id: dto.colorId },
         });
         if (!colorExists) {
            throw new NotFoundException(`Цвет с ID ${dto.colorId} не найден!`);
         }
      }

      try {
         // 3. Создаем вариант товара со всеми вложенными свойствами
         return await this.prisma.productVariant.create({
            data: {
               price: dto.price,
               sku: dto.sku,
               stock: dto.stock,
               discount: dto.discount,
               productId: productId,
               colorId: dto.colorId || null,
               // Записываем динамические свойства, если они переданы
               properties:
                  dto.properties && dto.properties.length > 0
                     ? {
                          create: dto.properties.map((prop) => ({
                             value: prop.value,
                             attributeId: prop.attributeId,
                          })),
                       }
                     : undefined,
            },
            // Возвращаем созданный объект вместе со связями для фронтенда
            include: {
               color: true,
               properties: {
                  include: {
                     attribute: true,
                  },
               },
            },
         });
      } catch (error: unknown) {
         // 4. Обрабатываем ошибку уникальности SKU (код ошибки P2002 в Prisma)
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
         ) {
            throw new ConflictException(
               `Вариант с артикулом (SKU) "${dto.sku}" уже существует!`,
            );
         }
         throw error;
      }
   }

   //Получение вариантов конкретной категории
   async getByCategory(
      categoryId: string,
      page: number = 1,
      perPage: number = 10,
      attributes?: string,
   ) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const whereCondition: Prisma.ProductVariantWhereInput = {
         product: {
            categoryId,
         },
      };

      if (attributes) {
         const attributeGroups = attributes.split(';'); // ['Бренд:Uno,Kodi', 'Объем:10мл']

         // Используем оператор AND, чтобы каждая группа фильтров (Бренд, Объем) сужала поиск
         whereCondition.AND = attributeGroups.map((group) => {
            const [attrName, valuesString] = group.split(':');
            const values = valuesString.split(','); // ['Uno', 'Kodi']

            return {
               // Смотрим во вложенную таблицу свойств текущего варианта
               properties: {
                  some: {
                     value: { in: values }, // Значение свойства совпадает с выбранными чекбоксами
                     attribute: {
                        name: attrName, // Имя характеристики совпадает (например, "Бренд")
                     },
                  },
               },
            };
         });
      }

      const [variants, totalCount] = await Promise.all([
         this.prisma.productVariant.findMany({
            where: whereCondition,
            include: {
               product: {
                  include: {
                     category: true,
                  },
               },
               properties: {
                  include: {
                     attribute: true, // Подтягиваем характеристики для отображения в карточке
                  },
               },
               color: true, // Подтягиваем цвет, если необходимо
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
         }),
         this.prisma.productVariant.count({
            where: whereCondition, // Подсчет только отфильтрованных строк
         }),
      ]);

      // проверка на пустой массив
      if (!variants || variants.length === 0) {
         throw new NotFoundException(
            'Варианты товаров для данной категории не найдены!',
         );
      }

      return {
         variants,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // Получение варианта по id
   async getById(id: string) {
      return this.prisma.productVariant.findUnique({
         where: { id },
         include: {
            color: true,
            properties: { include: { attribute: true } },
            product: {
               include: {
                  reviews: {
                     include: {
                        user: true,
                     },
                  },
                  category: true,
                  variants: {
                     include: { color: true },
                  },
               },
            },
         },
      });
   }

   // Получение всех вариантов конкретного товара (нужно для админки)
   async getByProductId(
      productId: string,
      page: number = 1,
      perPage: number = 10,
   ) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [variants, totalCount] = await Promise.all([
         this.prisma.productVariant.findMany({
            where: { productId },
            skip,
            take,
            include: {
               product: true,
               color: true,
               properties: { include: { attribute: true } },
            },
            orderBy: { createdAt: 'desc' },
         }),
         this.prisma.productVariant.count(),
      ]);

      return {
         variants,
         meta: {
            totalCount,
            currrentPage: page || 1,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение популярных вариантов
   async getMostPopular() {
      const popularVariants = await this.prisma.productVariant.findMany({
         where: {
            // Исключаем из топа варианты, которые ни разу не покупали
            orderItems: {
               some: {},
            },
         },
         include: {
            product: {
               include: {
                  category: true,
               },
            },
         },
         orderBy: {
            orderItems: {
               _count: 'desc', // Сортируем по количеству записей в заказах
            },
         },
         take: 10, // Ограничиваем топ-10
      });

      return popularVariants;
   }

   //Обновление варианта товара
   async update(variantId: string, dto: ProductVariantDto) {
      try {
         // Используем транзакцию, если нужно обновить массив свойств properties
         return await this.prisma.$transaction(async (tx) => {
            // Если фронтенд передал новый массив свойств, сначала очищаем старые связи
            if (dto.properties) {
               await tx.variantProperty.deleteMany({
                  where: { variantId },
               });
            }

            return await tx.productVariant.update({
               where: { id: variantId },
               data: {
                  price: dto.price,
                  sku: dto.sku,
                  stock: dto.stock,
                  discount: dto.discount,
                  colorId: dto.colorId !== undefined ? dto.colorId : undefined,
                  // Записываем новые свойства поверх удаленных
                  properties:
                     dto.properties && dto.properties.length > 0
                        ? {
                             create: dto.properties.map((prop) => ({
                                value: prop.value,
                                attributeId: prop.attributeId,
                             })),
                          }
                        : undefined,
               },
               include: {
                  color: true,
                  properties: { include: { attribute: true } },
               },
            });
         });
      } catch (error: unknown) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
               throw new NotFoundException('Вариант товара не найден!');
            }
            if (error.code === 'P2002') {
               throw new ConflictException(
                  `Артикул (SKU) "${dto.sku}" уже занят другим товаром!`,
               );
            }
         }
         throw error;
      }
   }

   //Удаление варианта товара
   async delete(variantId: string) {
      try {
         return await this.prisma.productVariant.delete({
            where: { id: variantId },
         });
      } catch (error: unknown) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
         ) {
            throw new NotFoundException('Вариант товара не найден!');
         }
         throw error;
      }
   }
}
