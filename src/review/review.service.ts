import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
   constructor(private prisma: PrismaService) {}

   // Получение всех отзывов магазина (админ)=======================
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [reviews, totalCount] = await Promise.all([
         this.prisma.review.findMany({
            skip,
            take,
            include: {
               user: {
                  select: {
                     id: true,
                     displayName: true,
                     email: true,
                     picture: true,
                  },
               },
               product: {
                  // Добавляем выборку товара
                  select: {
                     title: true,
                  },
               },
            },
            orderBy: { createdAt: 'desc' },
         }),
         this.prisma.review.count(),
      ]);

      return {
         reviews,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   // Получение всех отзывов товара=======================
   async getByProduct(variantId: string) {
      const variant = await this.prisma.productVariant.findUnique({
         where: { id: variantId },
         select: { productId: true },
      });

      if (!variant) {
         throw new NotFoundException('Вариант товара не найден!');
      }

      return this.prisma.review.findMany({
         where: { id: variant.productId },
         include: { user: true },
         orderBy: { createdAt: 'desc' },
      });
   }

   //Получение отзыва по id===============================
   async getById(reviewId: string, userId: string) {
      const review = await this.prisma.review.findUnique({
         where: {
            id: reviewId,
            userId,
         },
         include: {
            user: true,
         },
      });

      if (!review)
         throw new NotFoundException(
            'Отзыв не найден или вы не являетесь его владельцем!',
         );

      return review;
   }

   //Создание отзыва======================================
   async create(userId: string, variantId: string, dto: ReviewDto) {
      const variant = await this.prisma.productVariant.findUnique({
         where: { id: variantId },
         select: { productId: true },
      });

      if (!variant) {
         throw new NotFoundException('Вариант товара не найден!');
      }

      return this.prisma.review.create({
         data: {
            ...dto,
            product: {
               connect: {
                  id: variant.productId,
               },
            },
            user: {
               connect: {
                  id: userId,
               },
            },
         },
      });
   }

   //Обновление отзыва
   async update(reviewId: string, userId: string, dto: ReviewDto) {
      // 1. Ищем отзыв в базе данных
      const review = await this.prisma.review.findUnique({
         where: { id: reviewId },
      });

      // 2. Проверяем, существует ли отзыв
      if (!review) {
         throw new NotFoundException('Отзыв не найден!');
      }

      // 3. Проверяем, является ли пользователь владельцем
      if (review.userId !== userId) {
         throw new ForbiddenException(
            'У вас нет прав для обновления этого отзыва!',
         );
      }

      return this.prisma.review.update({
         where: { id: reviewId },
         data: dto,
      });
   }

   //Удаление отзыва=====================================
   async delete(reviewId: string, userId: string, userRole: UserRole) {
      // 1. Ищем отзыв
      const review = await this.prisma.review.findUnique({
         where: { id: reviewId },
      });

      // 2. Проверяем существование
      if (!review) {
         throw new NotFoundException('Отзыв не найден!');
      }

      // 3. Проверяем права владельца
      if (review.userId !== userId && userRole !== UserRole.ADMIN) {
         throw new ForbiddenException(
            'У вас нет прав для удаления этого отзыва!',
         );
      }

      // 4. Удаляем отзыв
      return this.prisma.review.delete({
         where: { id: reviewId },
      });
   }
}
