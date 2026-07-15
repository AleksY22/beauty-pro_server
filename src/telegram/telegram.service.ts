/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { OrderStatus } from '../generated/prisma/enums';

interface IDelivery {
   id: string;
   name: string;
}

interface IPayment {
   id: string;
   name: string;
}

interface OrderItem {
   id: string;
   quantity: number;
   priceAtPurchase: number;
   variant?: {
      product?: {
         title: string;
      };
   };
}

interface Order {
   id: string;
   firstName: string;
   lastName?: string | null;
   phone: string;
   email: string;
   address?: string | null;
   comment?: string | null;
   status: OrderStatus;
   total: number;
   items: OrderItem[];
   deliveryMethod: IDelivery;
   paymentMethod: IPayment;
}

@Injectable()
export class TelegramService implements OnModuleInit {
   private readonly logger = new Logger(TelegramService.name);
   private bot: Telegraf | null = null;
   private adminChatId: string | null = null;

   constructor(private readonly configService: ConfigService) {
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      this.adminChatId =
         this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID') ?? null;

      if (token && this.adminChatId) {
         this.bot = new Telegraf(token);
      } else {
         this.logger.warn(
            'Telegram Bot не запущен: отсутствуют TELEGRAM_BOT_TOKEN или TELEGRAM_ADMIN_CHAT_ID в .env',
         );
      }
   }

   onModuleInit() {
      if (this.bot) {
         try {
            // Запускаем бота в режиме лонг-поллинга (не блокирует поток)
            this.bot.launch();
            this.logger.log('Telegram Bot успешно запущен и готов к работе.');
         } catch (error: any) {
            this.logger.error(
               `Не удалось запустить Telegram Bot: ${error.message}`,
            );
         }
      }
   }

   //=======================================================
   public async sendAdminNotification(order: Order) {
      if (!this.bot || !this.adminChatId) return;

      try {
         const itemsText = order.items
            .map(
               (item: any) =>
                  `▪️ ${item.variant?.product?.title} (${item.quantity} шт.)`,
            )
            .join('\n');

         const deliveryName = order.deliveryMethod?.name || 'Не указан';
         const paymentName = order.paymentMethod?.name || 'Не указан';

         const message = `🛍 *НОВЫЙ ЗАКАЗ №${order.id}*

👤 *Покупатель:* ${order.firstName} ${order.lastName || ''}
📞 *Телефон:* ${order.phone}
📧 *Email:* ${order.email}
🚚 *Способ доставки:* ${deliveryName}
📍 *Адрес:* ${order.address || ''}
💳 *Способ оплаты:* ${paymentName}
💬 *Комментарий:* ${order.comment || 'Нет'}

📦 *Состав заказа:*
${itemsText}

💰 *Сумма:* ${order.total.toFixed(2)} BYN
⚙️ *Статус:* ${order.status}`;

         await this.bot.telegram.sendMessage(this.adminChatId, message, {
            parse_mode: 'Markdown',
         });
      } catch (error: any) {
         this.logger.error(
            `Ошибка отправки сообщения в Telegram: ${error.message}`,
         );
      }
   }

   //=========================================================
   public async sendAdminCancellationNotification(order: Order) {
      if (!this.bot || !this.adminChatId) return;

      try {
         // 1. Формируем список товаров, которые вернулись на склад
         const itemsText = order.items
            .map(
               (item: any) =>
                  `▪️ ${item.variant?.product?.title} (${item.quantity} шт.)`,
            )
            .join('\n');

         const orderNumber = order.id.slice(-6).toUpperCase();

         // 2. Конструируем сообщение об отмене
         const message = `❌ *ЗАКАЗ №${orderNumber} ОТМЕНЕН*

👤 *Покупатель:* ${order.firstName} ${order.lastName ?? ''}
📞 *Телефон:* \`${order.phone}\`
📧 *Email:* ${order.email}

🚚 *Способ доставки:* ${order.deliveryMethod?.name || 'Не указан'}
💳 *Способ оплаты:* ${order.paymentMethod?.name || 'Не указан'}

📦 *Товары, вернувшиеся на склад:*
${itemsText}

💰 *Сумма несостоявшейся сделки:* ${order.total.toFixed(2)} BYN
⚙️ *Новый статус заказа:* \`CANCELLED\``;

         // 3. Отправляем сообщение администраторам
         await this.bot.telegram.sendMessage(this.adminChatId, message, {
            parse_mode: 'Markdown',
         });
      } catch (error: any) {
         this.logger.error(
            `Ошибка отправки сообщения об отмене в Telegram: ${error.message}`,
         );
      }
   }
}
