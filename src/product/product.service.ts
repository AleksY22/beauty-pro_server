import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { FileService } from '../file/file.service';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
   constructor(
      private prisma: PrismaService,
      private readonly fileService: FileService,
   ) {}

   //Функция поиска=======================================
   private async getSearchTermFilter(
      searchTerm: string,
      page: number = 1,
      perPage: number = 10,
   ) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const whereCondition = {
         OR: [
            {
               title: {
                  contains: searchTerm,
                  mode: 'insensitive' as const, // фиксируем тип для Prisma
               },
            },
            {
               description: {
                  contains: searchTerm,
                  mode: 'insensitive' as const,
               },
            },
         ],
      };
      const [products, totalCount] = await Promise.all([
         this.prisma.product.findMany({
            where: whereCondition,
            skip,
            take,
            include: {
               category: true,
               variants: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         }),
         this.prisma.product.count({
            where: whereCondition,
         }),
      ]);
      return {
         products,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение всех товаров================================
   async getAll(searchTerm?: string, page: number = 1, perPage: number = 10) {
      if (searchTerm)
         return this.getSearchTermFilter(searchTerm, page, perPage);

      const skip = (page - 1) * perPage;
      const take = perPage;

      const [products, totalCount] = await Promise.all([
         this.prisma.product.findMany({
            skip,
            take,
            include: {
               category: true,
               variants: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         }),
         this.prisma.product.count(),
      ]);

      return {
         products,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение товара по id===============================
   async getById(productId: string) {
      const product = await this.prisma.product.findUnique({
         where: {
            id: productId,
         },
         include: {
            category: true,
            variants: {
               include: {
                  color: true,
                  properties: { include: { attribute: true } },
               },
            },
            reviews: {
               include: {
                  user: true,
               },
            },
         },
      });

      if (!product) throw new NotFoundException('Товар не найден!');

      return product;
   }

   //Получение товаров по категории=============================
   async getByCategory(categoryId: string) {
      const products = await this.prisma.product.findMany({
         where: {
            categoryId,
         },
         include: {
            category: true,
            variants: true,
         },
      });

      if (!products || products.length === 0)
         throw new NotFoundException('Товары не найдены!');

      return products;
   }

   //Получение популярных товаров==============================
   async getMostPopular() {
      const popularVariants = await this.prisma.orderItem.groupBy({
         by: ['variantId'],
         _count: {
            id: true,
         },
         orderBy: {
            _count: {
               id: 'desc',
            },
         },
      });

      if (!popularVariants) throw new NotFoundException('Товары не найдены!');

      const variantIds = popularVariants.map((item) => item.variantId);

      // Находим уникальные товары, к которым относятся эти популярные варианты
      const products = await this.prisma.product.findMany({
         where: {
            variants: {
               some: { id: { in: variantIds } },
            },
         },
         include: {
            category: true,
            variants: true,
         },
      });

      return products;
   }

   //Получение похожих товаров===========================
   async getSimilar(variantId: string) {
      const currentVariant = await this.prisma.productVariant.findUnique({
         where: { id: variantId },
         include: { product: true },
      });

      if (!currentVariant || !currentVariant.product) {
         throw new NotFoundException('Вариант товара не найден');
      }

      return this.prisma.productVariant.findMany({
         where: {
            NOT: { id: variantId }, // Исключаем текущий вариант
            stock: { gt: 0 }, // Только в наличии
            product: {
               categoryId: currentVariant.product.categoryId, // Та же категория
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
         include: {
            product: true,
         },
         //ограничить количество, чтобы не грузить лишнего
         take: 5,
      });
   }

   //Уменьшение остатков на складе===========================
   async decreaseStock(
      variantId: string,
      quantity: number,
      tx?: Prisma.TransactionClient,
   ) {
      const client = tx || this.prisma;

      try {
         return await client.productVariant.update({
            where: {
               id: variantId,
               stock: { gte: quantity }, // Защита от ухода в минус
            },
            data: {
               stock: { decrement: quantity },
            },
         });
      } catch (error) {
         // Ловим ошибку отсутствия записи (когда stock < quantity)
         if (error) {
            throw new BadRequestException(
               `Недостаточно товара на складе для id: ${variantId}`,
            );
         }
         throw error;
      }
   }

   //Создание товара========================================
   async create(dto: ProductDto) {
      return this.prisma.product.create({
         data: {
            title: dto.title,
            description: dto.description,
            images: dto.images,
            categoryId: dto.categoryId,
         },
      });
   }

   //Обновление товара=======================================
   async update(productId: string, dto: ProductDto) {
      await this.getById(productId); //для проверки наличия товара

      return this.prisma.product.update({
         where: {
            id: productId,
         },
         data: dto,
      });
   }

   //Удаление товара===========================================
   async delete(productId: string) {
      const product = await this.getById(productId); //для проверки наличия товара

      //удаление картинок товара из blob vercel
      if (product && product.images) {
         await this.fileService.deleteFiles(product.images);
      }

      return this.prisma.product.delete({
         where: {
            id: productId,
         },
      });
   }
}
