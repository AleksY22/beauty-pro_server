import { ICapturePayment, YooCheckout } from '@a2seven/yoo-checkout';
import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '../generated/prisma/client';
import { OrderStatus } from '../generated/prisma/enums';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { ProductService } from '../product/product.service';
import { TelegramService } from '../telegram/telegram.service';
import { OrderDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';

interface YookassaPaymentResponse {
   id: string;
   status: string;
   amount: {
      value: string;
      currency: string;
   };
   confirmation: {
      type: 'redirect';
      confirmation_url: string;
   };
   metadata?: Record<string, any>;
}

const checkout = new YooCheckout({
   shopId: process.env['YOOKASSA_SHOP_ID'] as string,
   secretKey: process.env['YOOKASSA_API_KEY'] as string,
});

// Интерфейс для результата сырого запроса к БД
interface RawVariant {
   id: string;
   price: number;
   stock: number;
   discount: number;
   product_id: string;
}

@Injectable()
export class OrderService {
   constructor(
      private prisma: PrismaService,
      private productService: ProductService,
      private telegramService: TelegramService,
      private mailService: MailService,
   ) {}

   // Получение всех заказов (для админа)==============
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [orders, totalCount] = await Promise.all([
         this.prisma.order.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
               user: true,
               items: {
                  include: {
                     variant: { include: { product: true, color: true } },
                  },
               },
            },
         }),
         this.prisma.order.count(),
      ]);
      return {
         orders,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // Получение заказов текущего пользователя============
   async getByUserId(userId: string, page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const whereFilter = { userId };

      const [orders, totalCount] = await Promise.all([
         this.prisma.order.findMany({
            skip,
            take,
            where: whereFilter,
            orderBy: { createdAt: 'desc' },
            include: {
               items: {
                  include: {
                     variant: { include: { product: true } },
                  },
               },
            },
         }),
         this.prisma.order.count({ where: whereFilter }),
      ]);
      return {
         orders,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение по id===============================
   async getById(orderId: string, currentUserId: string | null) {
      const order = await this.prisma.order.findUnique({
         where: {
            id: orderId,
         },
         include: {
            user: true,
            deliveryMethod: true,
            paymentMethod: true,
            items: {
               include: {
                  variant: { include: { product: true, color: true } },
               },
            },
         },
      });

      if (!order) throw new NotFoundException('Заказ не найден!');

      if (order.userId && order.userId !== currentUserId) {
         throw new ForbiddenException(
            'У вас нет прав для просмотра этого заказа',
         );
      }

      return order;
   }

   //Изменение статуса заказа вручную=======================
   async updateStatusManual(orderId: string, newStatus: OrderStatus) {
      type OrderWithRelations = Prisma.OrderGetPayload<{
         include: {
            items: { include: { variant: { include: { product: true } } } };
            deliveryMethod: true;
            paymentMethod: true;
         };
      }>;

      let orderForNotifications: OrderWithRelations | null = null;

      await this.prisma.$transaction(async (tx) => {
         // 1. Ищем заказ со всеми include-связями
         const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
               items: { include: { variant: { include: { product: true } } } },
               deliveryMethod: true,
               paymentMethod: true,
            },
         });

         if (!order) {
            throw new NotFoundException(`Заказ №${orderId} не найден`);
         }

         // Если статус совпадает с текущим — прерываем выполнение
         if (order.status === newStatus) {
            return;
         }

         if (newStatus === OrderStatus.CANCELLED && order.items.length > 0) {
            for (const item of order.items) {
               await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: {
                     stock: { increment: item.quantity },
                  },
               });
            }
         }

         // 3. Обновляем статус заказа в базе данных
         const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: {
               items: { include: { variant: { include: { product: true } } } },
               deliveryMethod: true,
               paymentMethod: true,
            },
         });

         // Применяем двойное приведение типов, чтобы гарантировать совместимость
         orderForNotifications = updatedOrder as any as OrderWithRelations;
      });

      // 4. ФАЗА УВЕДОМЛЕНИЙ (Выполняется асинхронно вне транзакции БД)
      if (orderForNotifications) {
         const safeOrder = orderForNotifications as OrderWithRelations;

         // Конвертируем Decimal в number для безопасного рендеринга шаблонов
         const formattedOrder = {
            ...safeOrder,
            total: Number(safeOrder.total),
            items: safeOrder.items.map((item) => ({
               ...item,
               priceAtPurchase: Number(item.priceAtPurchase),
               variant: {
                  ...item.variant,
                  price: Number(item.variant.price),
               },
            })),
         };

         setTimeout(() => {
            const runNotifications = async () => {
               try {
                  if (newStatus === OrderStatus.CANCELLED) {
                     // Отправляем официальное письмо покупателю и уведомление админам в ТГ
                     await this.mailService.sendOrderCancellation(
                        formattedOrder.email,
                        formattedOrder,
                     );
                     await this.telegramService.sendAdminCancellationNotification(
                        formattedOrder,
                     );
                  }
               } catch (notificationError) {
                  console.error(
                     'Ошибка отправки уведомления при ручной смене статуса:',
                     notificationError,
                  );
               }
            };
            runNotifications().catch((err) => {
               console.error('Критический сбой обработчика уведомлений:', err);
            });
         });
      }
   }

   //Создание заказа=============================
   async createPayment(dto: OrderDto, userId: string | null) {
      console.error(1);
      const idempotenceKey = uuidv4();
      const finalizedOrder = await this.prisma.$transaction(async (tx) => {
         let total = 0;
         const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
         const validatedVariants: Array<{
            id: string;
            finalPrice: number;
            quantity: number;
         }> = [];

         //Проверяем метод доставки
         const delivery = await tx.deliveryMethod.findFirst({
            where: { id: dto.deliveryMethodId, isEnabled: true },
         });

         if (!delivery)
            throw new BadRequestException('Способ доставки недоступен!');

         //Проверяем метод оплаты
         const payment = await tx.paymentMethod.findFirst({
            where: { id: dto.paymentMethodId, isEnabled: true },
         });

         if (!payment)
            throw new BadRequestException('Способ оплаты недоступен');

         // Проверяем наличие товара на складе (FOR UPDATE)
         for (const item of dto.items) {
            const [variant] = await tx.$queryRaw<RawVariant[]>`
            SELECT id, price, stock, discount FROM "product_variant" WHERE id = ${item.variantId} FOR UPDATE
         `;

            if (!variant)
               throw new BadRequestException(
                  `Товар ${item.variantId} не найден`,
               );
            if (variant.stock < item.quantity)
               throw new BadRequestException(`Недостаточно товара на складе`);

            const basePrice = Number(variant.price);
            const finalPrice = basePrice - (basePrice * variant.discount) / 100;
            total += finalPrice * item.quantity;

            validatedVariants.push({
               id: variant.id,
               finalPrice,
               quantity: item.quantity,
            });
            orderItemsData.push({
               quantity: item.quantity,
               priceAtPurchase: finalPrice,
               variant: { connect: { id: item.variantId } },
            });
         }

         // Создаем заказ со статусом PENDING и списываем stock
         const newOrder = await tx.order.create({
            data: {
               status: OrderStatus.PENDING,
               items: { create: orderItemsData },
               total,
               ...(userId ? { user: { connect: { id: userId } } } : {}),
               firstName: dto.firstName,
               lastName: dto.lastName || null,
               phone: dto.phone,
               email: dto.email,
               address: dto.address || null,
               comment: dto.comment || null,
               paymentMethod: { connect: { id: dto.paymentMethodId } },
               deliveryMethod: { connect: { id: dto.deliveryMethodId } },
            },
            include: {
               paymentMethod: true,
            },
         });

         // Списываем количество со склада
         for (const item of validatedVariants) {
            await tx.productVariant.update({
               where: { id: item.id },
               data: { stock: { decrement: item.quantity } },
            });
         }

         if (userId) {
            await tx.cartItem.deleteMany({
               where: {
                  userId: userId,
               },
            });
         }

         // Передаем данные дальше из транзакции
         return { newOrder, validatedVariants, total };
      });

      // ФАЗА 2: Отправка уведомления администраторам в Telegram (ВНЕ транзакции)
      try {
         const fullOrderForNotifications = await this.prisma.order.findUnique({
            where: { id: finalizedOrder.newOrder.id },
            include: {
               items: {
                  include: {
                     variant: {
                        include: { product: true },
                     },
                  },
               },
               deliveryMethod: true,
               paymentMethod: true,
            },
         });

         if (fullOrderForNotifications) {
            const formattedOrder = {
               ...fullOrderForNotifications,
               total: Number(fullOrderForNotifications.total), // Приводим total к number
               items: fullOrderForNotifications.items.map((item) => ({
                  ...item,
                  priceAtPurchase: Number(item.priceAtPurchase), // Приводим цену покупки к number
                  variant: {
                     ...item.variant,
                     price: Number(item.variant.price), // Приводим базовую цену SKU к number
                  },
               })),
            };

            await this.telegramService.sendAdminNotification(formattedOrder);

            await this.mailService.sendOrderConfirmation(
               formattedOrder.email,
               formattedOrder,
            );
         }
      } catch (notificationError) {
         // Логируем ошибки внешних сервисов рассылок, но НЕ прерываем процесс оплаты для клиента
         console.error(
            'Ошибка при отправке Email или Telegram уведомления:',
            notificationError,
         );
      }

      const paymentCode =
         finalizedOrder.newOrder.paymentMethod.code?.toUpperCase();

      if (paymentCode === 'CASH' || paymentCode === 'ERIP') {
         return {
            orderId: finalizedOrder.newOrder.id,
            paymentUrl: null, // Фронтенд увидит null и перенаправит на страницу /orders/success
         };
      }

      // ФАЗА 3: Стучимся в ЮKassa и передаем туда уже ГОТОВЫЙ finalizedOrder.id в metadata
      try {
         const payment = (await checkout.createPayment(
            {
               amount: {
                  value: finalizedOrder.total.toFixed(2),
                  currency: 'RUB',
               },
               payment_method_data: { type: 'bank_card' },
               confirmation: {
                  type: 'redirect',
                  return_url: `${process.env.CLIENT_URL}/thanks?orderId=${finalizedOrder.newOrder.id}`,
               },
               description: `Оплата заказа №${finalizedOrder.newOrder.id} в BeautyPro`,
               metadata: {
                  orderId: finalizedOrder.newOrder.id, // Передаем ID для вебхука!
               },
            },
            idempotenceKey,
         )) as YookassaPaymentResponse;

         return {
            orderId: finalizedOrder.newOrder.id,
            paymentUrl: payment.confirmation.confirmation_url,
         };
      } catch (paymentError) {
         // Логика экстренного восстановления склада, если платежный шлюз недоступен
         await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
               where: { id: finalizedOrder.newOrder.id },
               data: { status: OrderStatus.CANCELLED },
            });
            for (const item of finalizedOrder.validatedVariants) {
               await tx.productVariant.update({
                  where: { id: item.id },
                  data: { stock: { increment: item.quantity } },
               });
            }
         });

         throw new InternalServerErrorException(
            `${paymentError}`,
            'Ошибка шлюза оплаты. Склад восстановлен.',
         );
      }
   }

   //Обновление статуса заказа===========================
   async updateStatus(dto: PaymentStatusDto) {
      // 1. Получаем ID заказа из описания платежа ЮKassa
      // const orderId = dto.object.description.split('#')[1];
      let orderId = dto.object?.metadata?.orderId;

      if (!orderId && dto.object?.description) {
         const parts = dto.object.description.split('#');
         if (parts.length > 1) {
            orderId = parts[1].trim();
         }
      }

      // Если платеж не связан с нашей системой заказов, игнорируем его
      if (!orderId) {
         console.log('❌ Отмена: orderId не найден в metadata запроса');
         return true;
      }

      // 2. ЮKassa заморозила деньги (двухстадийный платеж) -> Списываем их окончательно
      if (dto.event === 'payment.waiting_for_capture') {
         const capturePayment: ICapturePayment = {
            amount: {
               value: dto.object.amount.value,
               currency: dto.object.amount.currency,
            },
         };
         // Вызываем подтверждение в ЮKassa.
         // Менять статус заказа здесь НЕ НУЖНО — ЮKassa через секунду пришлет новый вебхук "payment.succeeded"

         try {
            // Передаем уникальный ключ (например, на основе ID платежа), чтобы избежать ошибок при повторном вебхуке
            const idempotenceKey = `capture-${dto.object.id}`;
            await checkout.capturePayment(
               dto.object.id,
               capturePayment,
               idempotenceKey,
            );
         } catch (captureError) {
            // Если платеж уже захвачен или находится в обработке, ЮKassa может выкинуть ошибку.
            // Логируем её, но возвращаем true, чтобы вебхук не слался повторно.
            console.error(
               `Ошибка подтверждения платежа ${dto.object.id}:`,
               captureError,
            );
         }
         return true;
      }

      // 3. Деньги успешно списаны -> Меняем статус заказа на оплаченный
      if (dto.event === 'payment.succeeded') {
         // Защита от повторных вебхуков: обновляем только если статус еще не изменен
         await this.prisma.order.updateMany({
            where: {
               id: orderId,
               status: { not: OrderStatus.PAID_AND_WAITING },
            },
            data: {
               status: OrderStatus.PAID_AND_WAITING,
            },
         });

         return true;
      }

      // 4. Платеж отменен пользователем или банком -> Возвращаем остатки на склад!
      if (dto.event === 'payment.cancelled') {
         try {
            type CancelledOrderWithRelations = Prisma.OrderGetPayload<{
               include: {
                  items: {
                     include: { variant: { include: { product: true } } };
                  };
                  deliveryMethod: true;
                  paymentMethod: true;
               };
            }>;

            const cancelledOrderForMail = await this.prisma.$transaction(
               async (tx) => {
                  // 1. Блокируем строку заказа для чтения (FOR UPDATE) и проверяем статус
                  const order = await tx.order.findUnique({
                     where: { id: orderId },
                     include: {
                        items: {
                           include: {
                              variant: {
                                 include: { product: true },
                              },
                           },
                        },
                        deliveryMethod: true,
                        paymentMethod: true,
                     },
                  });

                  // Если заказ не найден или уже отменен — прерываем транзакцию
                  if (!order) {
                     throw new NotFoundException(`Заказ ${orderId} не найден`);
                  }
                  if (order.status === OrderStatus.CANCELLED) {
                     return;
                  }

                  // 2. Меняем статус заказа на Отменен
                  await tx.order.update({
                     where: { id: orderId },
                     data: { status: OrderStatus.CANCELLED },
                  });

                  // 3. Возвращаем товары на склад
                  for (const item of order.items) {
                     await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: { increment: item.quantity } },
                     });
                  }
                  return order;
               },
            );

            // Отправляем письмо покупателю об отмене (ВНЕ пула транзакции СУБД)
            if (cancelledOrderForMail) {
               const safeOrder =
                  cancelledOrderForMail as CancelledOrderWithRelations;
               const formattedCancelledOrder = {
                  ...safeOrder,
                  total: Number(safeOrder.total),
                  items: safeOrder.items.map((item) => ({
                     ...item,
                     priceAtPurchase: Number(item.priceAtPurchase),
                     variant: {
                        ...item.variant,
                        price: Number(item.variant.price),
                     },
                  })),
               };

               await this.mailService.sendOrderCancellation(
                  formattedCancelledOrder.email,
                  formattedCancelledOrder,
               );

               await this.telegramService.sendAdminCancellationNotification(
                  formattedCancelledOrder,
               );
            }
         } catch (transactionError) {
            console.error(
               `Ошибка при отмене заказа ${orderId} через вебхук:`,
               transactionError,
            );
            // Не выкидываем HTTP-ошибку наружу, чтобы ЮKassa не зацикливала запросы
         }

         return true;
      }
      return true;
   }
}
