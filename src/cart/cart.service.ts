import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LocalDetailsDto, ValidateLocalCartDto } from './dto/cart.dto';

export class CartService {
   constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
   //Получить корзину пользователя с полной информацией о товарах
   async getCart(userId: string) {
      return this.prisma.cartItem.findMany({
         where: { userId },
         include: {
            variant: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        images: true,
                     },
                  },
                  color: true,
               },
            },
         },
         orderBy: { createdAt: 'desc' },
      });
   }

   //Получение полной информации для корзины гостя
   async getLocalCartDetails(dto: LocalDetailsDto) {
      const { variantIds } = dto;

      if (!variantIds || variantIds.length === 0) {
         return [];
      }

      const variants = await this.prisma.productVariant.findMany({
         where: {
            id: { in: variantIds },
         },
         include: {
            product: {
               select: {
                  id: true,
                  title: true,
                  images: true,
               },
            },
            color: true,
         },
      });

      // Мапим результат в структуру ICartItemResponse,
      // чтобы она 1-в-1 совпадала с методом getCart() для авторизованных
      return variants.map((variant) => ({
         id: `guest_${variant.id}`, // Генерируем временный id строки
         createdAt: new Date(),
         updatedAt: new Date(),
         quantity: 1,
         variantId: variant.id,
         variant: {
            id: variant.id,
            price: variant.price.toString(),
            discount: variant.discount,
            stock: variant.stock,
            sku: variant.sku,
            productId: variant.productId,
            product: variant.product,
            color: variant.color,
         },
      }));
   }

   async validateLocalCart(dto: ValidateLocalCartDto) {
      const { items } = dto;
      const errors: string[] = [];
      const validatedItems: { variantId: string; quantity: number }[] = [];

      for (const item of items) {
         const variant = await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: {
               product: { select: { title: true } },
            },
         });

         if (!variant) {
            errors.push(
               `Товар с ID модификации ${item.variantId} больше не существует.`,
            );
            continue;
         }

         // Проверяем, не превысил ли гость доступный остаток на складе
         if (item.quantity > variant.stock) {
            errors.push(
               `Товар "${variant.product.title}" (SKU: ${variant.sku}) доступен в количестве ${variant.stock} шт. Вы указали: ${item.quantity} шт.`,
            );
         }

         // Сохраняем скорректированное количество
         validatedItems.push({
            variantId: item.variantId,
            quantity: Math.min(item.quantity, variant.stock),
         });
      }

      // 2. Только после проверки ВСЕХ товаров смотрим, были ли ошибки
      if (errors.length > 0) {
         throw new BadRequestException({
            message:
               'Некоторые товары в корзине недоступны в выбранном количестве.',
            errors,
            suggestedItems: validatedItems,
         });
      }

      // 3. Если всё отлично, возвращаем успешный статус для всей корзины
      return { isValid: true, items: validatedItems };
   }

   //Добавление или изменение количества товара (с валидацией остатков на складе)
   async updateQuantity(userId: string, variantId: string, quantity: number) {
      const variant = await this.prisma.productVariant.findUnique({
         where: { id: variantId },
      });

      if (!variant) {
         throw new NotFoundException('Данный товарный вариант (SKU) не найден');
      }

      if (quantity > variant.stock) {
         throw new BadRequestException(
            `Невозможно добавить ${quantity} шт. На складе доступно только ${variant.stock} шт.`,
         );
      }

      return this.prisma.cartItem.upsert({
         where: {
            userId_variantId: { userId, variantId },
         },
         update: {
            // Прибавляем единицу к текущему значению в базе данных
            quantity: { increment: quantity },
         },
         create: { userId, variantId, quantity },
      });
   }

   // 3. Удаление одной позиции из корзины
   async removeItem(userId: string, variantId: string) {
      try {
         await this.prisma.cartItem.delete({
            where: {
               userId_variantId: { userId, variantId },
            },
         });
         return { success: true };
      } catch (error) {
         throw new NotFoundException(error, 'Товар в корзине не найден');
      }
   }

   // 4. Полная очистка корзины (понадобится при создании заказа)
   async clearCart(userId: string) {
      await this.prisma.cartItem.deleteMany({
         where: { userId },
      });
      return { success: true };
   }

   // 5. Слияние гостевой корзины (localStorage) с корзиной в БД при авторизации
   async mergeCart(
      userId: string,
      localItems: { variantId: string; quantity: number }[],
   ) {
      if (!localItems || localItems.length === 0) {
         return this.getCart(userId);
      }

      for (const item of localItems) {
         const variant = await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
         });

         if (!variant) continue; // Пропускаем, если такого SKU больше нет в базе

         // Ищем, есть ли уже этот товар в корзине юзера в БД
         const existingDbItem = await this.prisma.cartItem.findUnique({
            where: { userId_variantId: { userId, variantId: item.variantId } },
         });

         // Считаем новое суммарное количество
         const currentQuantity = existingDbItem ? existingDbItem.quantity : 0;
         const targetQuantity = currentQuantity + item.quantity;

         // Ограничиваем остатком на складе
         const finalQuantity = Math.min(targetQuantity, variant.stock);

         if (finalQuantity > 0) {
            await this.prisma.cartItem.upsert({
               where: {
                  userId_variantId: { userId, variantId: item.variantId },
               },
               update: { quantity: finalQuantity },
               create: {
                  userId,
                  variantId: item.variantId,
                  quantity: finalQuantity,
               },
            });
         }
      }

      return this.getCart(userId);
   }
}
