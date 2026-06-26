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
            cartItems: {
               include: {
                  variant: {
                     include: {
                        product: true,
                        color: true,
                     },
                  },
               },
            },
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
            cartItems: {
               include: {
                  variant: {
                     include: {
                        product: true,
                        color: true,
                     },
                  },
               },
            },
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
            cartItems: {
               include: {
                  variant: {
                     include: {
                        product: true,
                        color: true,
                     },
                  },
               },
            },
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
      // 1. Проверяем напрямую, связана ли эта пара userId и productId
      const favoriteExists = await this.prismaService.product.findFirst({
         where: {
            id: productId,
            favoritedBy: {
               some: {
                  id: userId,
               },
            },
         },
      });

      // 2. Делаем connect или disconnect одной операцией без загрузки всего профиля
      await this.prismaService.user.update({
         where: {
            id: userId,
         },
         data: {
            favorites: {
               [favoriteExists ? 'disconnect' : 'connect']: {
                  id: productId,
               },
            },
         },
      });

      return true;
   }
}
