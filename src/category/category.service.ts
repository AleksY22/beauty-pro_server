import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma.service';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
   constructor(
      private prisma: PrismaService,
      private readonly fileService: FileService,
   ) {}

   //Получение всех категорий для магазина==================
   async getAll(page: number = 1, perPage: number = 10) {
      const skip = (page - 1) * perPage;
      const take = perPage;

      const [categories, totalCount] = await Promise.all([
         this.prisma.category.findMany({
            skip,
            take,
         }),
         this.prisma.category.count(),
      ]);

      return {
         categories,
         meta: {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            hasMore: page * perPage < totalCount,
         },
      };
   }

   //Получение категории по id===============================
   async getById(categoryId: string) {
      const category = await this.prisma.category.findUnique({
         where: {
            id: categoryId,
         },
      });

      if (!category) throw new NotFoundException('Категория не найдена!');

      // Достаем все свойства вариантов, принадлежащих продуктам этой категории
      const properties = await this.prisma.variantProperty.findMany({
         where: {
            variant: {
               product: {
                  categoryId: categoryId,
               },
            },
         },
         include: {
            attribute: true,
         },
      });

      // Группируем полученные свойства в удобный формат: Название -> Массив уникальных значений
      const attributesMap: Record<string, Set<string>> = {};

      properties.forEach((prop) => {
         const attrName = prop.attribute.name;
         if (!attributesMap[attrName]) {
            attributesMap[attrName] = new Set<string>();
         }
         attributesMap[attrName].add(prop.value);
      });

      // Преобразуем карту в массив объектов для фронтенда [{ name: "Бренд", values: [...] }]
      const availableAttributes = Object.entries(attributesMap).map(
         ([name, valuesSet]) => ({
            name,
            values: Array.from(valuesSet),
         }),
      );

      // Возвращаем объект категории вместе с динамически сгенерированными фильтрами
      return {
         ...category,
         availableAttributes,
      };
   }

   //Создание категории======================================
   async create(dto: CategoryDto) {
      return this.prisma.category.create({
         data: {
            title: dto.title,
            description: dto.description,
            image: dto.image,
         },
      });
   }

   //Обновление категории=====================================
   async update(categoryId: string, dto: CategoryDto) {
      await this.getById(categoryId); //для проверки наличия категории

      return this.prisma.category.update({
         where: {
            id: categoryId,
         },
         data: {
            title: dto.title,
            description: dto.description,
            image: dto.image,
         },
      });
   }

   //Удаление категории========================================
   async delete(categoryId: string) {
      const category = await this.getById(categoryId); //для проверки наличия категории

      //удаление картинки категории из blob vercel
      if (category && category.image) {
         await this.fileService.deleteFiles(category.image);
      }

      return this.prisma.category.delete({
         where: {
            id: categoryId,
         },
      });
   }
}
