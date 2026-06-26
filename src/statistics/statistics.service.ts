import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { type Cache } from 'cache-manager';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { OrderStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma.service';

dayjs.locale('ru');

const monthNames = [
   'янв',
   'фев',
   'мар',
   'апр',
   'мая',
   'июн',
   'июл',
   'авг',
   'сен',
   'окт',
   'ноя',
   'дек',
];

@Injectable()
export class StatisticsService {
   constructor(
      private prisma: PrismaService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
   ) {}

   async getMainStatistics() {
      const cacheKey = 'main_statistics';

      // Проверяем кэш
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) return cachedData;

      const totalRevenue = await this.calculateTotalRevenue();

      const productsCount = await this.countProducts();
      const categoriesCount = await this.countCategories();

      const averageRating = await this.calculateAverageRating();

      const statistics = [
         { id: 1, name: 'Выручка', value: totalRevenue },
         { id: 2, name: 'Товары', value: productsCount },
         { id: 3, name: 'Категории', value: categoriesCount },
         { id: 4, name: 'Рейтинг', value: averageRating || 0 },
      ];

      // Сохраняем в кэш на 10 минут (600000 мс)
      await this.cacheManager.set(cacheKey, statistics, 600000);

      return statistics;
   }

   async getMiddleStatistics() {
      const cacheKey = 'middle_statistics';
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) return cachedData;

      const monthlySales = await this.calculateMonthlySales();

      const lastUsers = await this.getLastUsers();

      const statistics = { monthlySales, lastUsers };

      await this.cacheManager.set(cacheKey, statistics, 600000);

      return statistics;
   }

   private async calculateTotalRevenue() {
      const result = await this.prisma.order.aggregate({
         where: {
            status: OrderStatus.COMPLETED,
         },
         _sum: {
            total: true,
         },
      });

      return result?._sum?.total ? result._sum.total.toNumber() : 0;
   }

   private async countProducts() {
      const productsCount = await this.prisma.product.count();
      return productsCount;
   }

   private async countCategories() {
      const categoriesCount = await this.prisma.category.count();
      return categoriesCount;
   }

   private async calculateAverageRating() {
      const averageRating = await this.prisma.review.aggregate({
         _avg: { rating: true },
      });
      return Number(averageRating._avg.rating?.toFixed(1)) || 0;
   }

   private async calculateMonthlySales() {
      // 1. Генерируем массив последних 30 дней с нулевыми значениями
      const last30Days = Array.from({ length: 30 }, (_, i) => {
         const date = dayjs().subtract(i, 'day');
         return {
            fullDate: date.format('YYYY-MM-DD'), // Используем для ключа
            displayDate: `${date.date()} ${monthNames[date.month()]}`, // Для отображения
            value: 0,
         };
      }).reverse(); // Переворачиваем, чтобы идти от прошлого к настоящему

      // 2. Получаем данные из базы
      const startDate = dayjs().subtract(30, 'days').startOf('day').toDate();
      const salesRaw = await this.prisma.order.findMany({
         where: {
            createdAt: { gte: startDate },
            status: OrderStatus.COMPLETED,
         },
      });

      const salesMap = new Map<string, number>();

      salesRaw.forEach((order) => {
         const dateKey = dayjs(order.createdAt).format('YYYY-MM-DD');
         const orderTotal = Number(order.total);

         salesMap.set(dateKey, (salesMap.get(dateKey) || 0) + orderTotal);
      });

      // 4. Сопоставляем шаблон дат с данными из Map
      return last30Days.map((day) => ({
         date: day.displayDate,
         value: salesMap.get(day.fullDate) || 0,
      }));
   }

   private async getLastUsers() {
      const lastUsers = await this.prisma.user.findMany({
         orderBy: { createdAt: 'desc' },
         take: 5,
         include: {
            orders: {
               where: { status: OrderStatus.COMPLETED },
               orderBy: { createdAt: 'desc' }, // Берем самый свежий заказ
               take: 1,
               include: { items: true },
            },
         },
      });

      return lastUsers.map((user) => {
         const lastOrder = user.orders[0];

         const total = lastOrder
            ? lastOrder.items.reduce(
                 (acc, item) =>
                    acc + Number(item.priceAtPurchase) * item.quantity,
                 0,
              )
            : 0;

         return {
            id: user.id,
            name: user.displayName,
            email: user.email,
            picture: user.picture,
            total,
         };
      });
   }
}
