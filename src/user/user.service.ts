import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthMethod } from '../generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
   public constructor(private readonly prismaService: PrismaService) {}

   //===================================================
   async getById(id: string) {
      const user = await this.prismaService.user.findUnique({
         where: {
            id,
         },
         include: {
            accounts: true,
            favorites: {
               include: {
                  category: true,
               },
            },
            orders: true,
         },
      });

      if (!user) {
         throw new NotFoundException(
            'Пользователь не найден. Пожалуйста, проверьте введенные данные.',
         );
      }

      return user;
   }

   //===================================================
   async getByEmail(email: string) {
      const user = await this.prismaService.user.findUnique({
         where: {
            email,
         },
         include: {
            accounts: true,
            favorites: true,
            orders: true,
         },
      });

      return user;
   }

   //Создание пользователя==================================
   async create(
      email: string,
      password: string,
      displayName: string,
      picture: string,
      method: AuthMethod,
      isVerified: boolean,
   ) {
      const user = await this.prismaService.user.create({
         data: {
            email,
            password: password ? await hash(password) : '',
            displayName,
            picture: picture ? picture : undefined,
            method,
            isVerified,
         },
         include: {
            accounts: true,
            favorites: {
               include: {
                  category: true,
               },
            },
            orders: true,
         },
      });

      return user;
   }

   //Обновление пользователя==================================
   async update(userId: string, dto: UpdateUserDto) {
      const updatedUser = await this.prismaService.user.update({
         where: {
            id: userId,
         },
         data: {
            email: dto.email,
            displayName: dto.name,
            isTwoFactorEnabled: dto.isTwoFactorEnabled,
         },
      });

      return updatedUser;
   }

   //Добавление в избранное===================================
   async toggleFavorite(productId: string, userId: string) {
      const user = await this.getById(userId);

      //Проверка существования данного товара в избранных
      const isExists = user?.favorites.some(
         (product) => product.id === productId,
      );

      await this.prismaService.user.update({
         where: {
            id: user?.id,
         },
         data: {
            favorites: {
               [isExists ? 'disconnect' : 'connect']: {
                  id: productId,
               },
            },
         },
      });

      return true;
   }
}
