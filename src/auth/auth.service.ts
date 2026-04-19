/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
   ConflictException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { Request, Response } from 'express';
import { User } from '../generated/prisma/client';
import { AuthMethod } from '../generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';
import { ProviderService } from './provider/provider.service';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';

@Injectable()
export class AuthService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly userService: UserService,
      private readonly configService: ConfigService,
      private readonly providerService: ProviderService,
      private readonly emailConfirmationService: EmailConfirmationService,
      private readonly twoFactorAuthService: TwoFactorAuthService,
   ) {}

   //Регистрация=======================================================
   async register(req: Request, dto: RegisterDto) {
      const isExistUser = await this.userService.getByEmail(dto.email);

      if (isExistUser) {
         throw new ConflictException(
            'Регистрация не удалась! Пользователь с таким email уже существует!',
         );
      }

      const newUser = await this.userService.create(
         dto.email,
         dto.password,
         dto.name,
         '',
         AuthMethod.CREDENTIALS,
         false,
      );

      await this.emailConfirmationService.sendVerificationToken(newUser.email);

      return {
         message:
            'Регистрация прошла успешно! Подтвердите ваш email. Сообщение отправлено на ваш почтовый адрес.',
      };
   }

   //Вход==============================================================
   async login(req: Request, dto: LoginDto) {
      const user = await this.userService.getByEmail(dto.email);

      if (!user || !user.password) {
         throw new NotFoundException('Пользователь не найден!');
      }

      const isValidPassword = await verify(user.password, dto.password);

      if (!isValidPassword) {
         throw new UnauthorizedException(
            'Неверный пароль! Попробуйте еще или восстановите пароль!',
         );
      }

      if (!user.isVerified) {
         await this.emailConfirmationService.sendVerificationToken(user.email);
         throw new UnauthorizedException(
            'Ваш email не подтвержден! Пожалуйста, проверьте вашу почту и подтвердите email',
         );
      }

      if (user.isTwoFactorEnabled) {
         if (!dto.code) {
            await this.twoFactorAuthService.sendTwoFactorToken(user.email);
            return {
               message:
                  'Проверьте вашу почту. Требуется код двухфакторной аутентификации.',
            };
         }
         await this.twoFactorAuthService.validateTwoFactorToken(
            user.email,
            dto.code,
         );
      }
      return this.saveSession(req, user);
   }

   //Извлечение профиля через соцсети=========================================
   public async extractProfileFromCode(
      req: Request,
      provider: string,
      code: string,
   ) {
      const providerInstance = this.providerService.findByService(provider);

      if (!providerInstance) {
         throw new NotFoundException(
            `Провайдер '${provider}' не найден! Проверьте правильность введенных данных.`,
         );
      }

      const profile = await providerInstance.findUserByCode(code);

      const account = await this.prisma.account.findFirst({
         where: {
            id: profile.id,
            provider: profile.provider,
         },
      });

      let user = account?.userId
         ? await this.userService.getById(account.userId)
         : null;

      if (user) {
         return this.saveSession(req, user);
      }

      user = await this.userService.create(
         profile.email,
         '',
         profile.name,
         profile.picture,
         AuthMethod[profile.provider.toUpperCase()],
         true,
      );

      if (!account) {
         await this.prisma.account.create({
            data: {
               userId: user.id,
               type: 'oauth',
               provider: profile.provider,
               accessToken: profile.access_token,
               refreshToken: profile.refresh_token,
               expiresAt: profile.expires_at,
            },
         });
      }
      return this.saveSession(req, user);
   }

   //Выход=============================================================
   public async logout(req: Request, res: Response): Promise<void> {
      return new Promise((resolve, reject) => {
         req.session.destroy((error) => {
            if (error) {
               return reject(
                  new InternalServerErrorException(
                     'Не удалось завершить сессию! Возможно возникла проблема с сервером или сессия уже была завершена.',
                  ),
               );
            }
            res.clearCookie(
               this.configService.getOrThrow<string>('SESSION_NAME'),
            );
            resolve();
         });
      });
   }

   //Сохранение сессии=================================================
   public async saveSession(req: Request, user: User) {
      return new Promise((resolve, reject) => {
         req.session.userId = user.id;

         req.session.save((error) => {
            if (error) {
               console.log(error);
               return reject(
                  new InternalServerErrorException(
                     'Не удалось сохранить сессию! Проверьте настройки параметров сессии!',
                  ),
               );
            }

            resolve({ user });
         });
      });
   }
}
