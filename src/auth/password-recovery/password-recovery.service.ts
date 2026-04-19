import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '../../generated/prisma/enums';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma.service';
import { UserService } from '../../user/user.service';
import { NewPasswordDto } from './dto/new-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class PasswordRecoveryService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly userService: UserService,
      private readonly mailService: MailService,
   ) {}

   //Сброс пароля===========================================================
   public async resetPassword(dto: ResetPasswordDto) {
      const existingUser = await this.userService.getByEmail(dto.email);

      if (!existingUser) {
         throw new NotFoundException(
            'Пользователь не найден! Проверьте введенный email.',
         );
      }

      const resetPasswordToken = await this.generateResetPasswordToken(
         existingUser.email,
      );

      await this.mailService.sendResetPassword(
         resetPasswordToken.email,
         resetPasswordToken.token,
      );

      return {
         message: 'Сообщение отправлено на ваш почтовый адрес.',
      };
   }

   //Установка нового пароля=================================================
   public async newPassword(dto: NewPasswordDto, token: string) {
      const existingToken = await this.prismaService.token.findFirst({
         where: {
            token,
            type: TokenType.PASSWORD_RESET,
         },
      });

      if (!existingToken) {
         throw new NotFoundException(
            'Токен не найден! Проверьте введенные данные или запросите новый токен.',
         );
      }

      const hasExpired = new Date(existingToken.expiresIn) < new Date();

      if (hasExpired) {
         throw new BadRequestException(
            'Токен сброса пароля истек! Запросите новый токен для подтверждения сброса пароля.',
         );
      }

      const existingUser = await this.userService.getByEmail(
         existingToken.email,
      );

      if (!existingUser) {
         throw new NotFoundException(
            'Пользователь не найден! Проверьте введенный email.',
         );
      }

      await this.prismaService.user.update({
         where: {
            id: existingUser.id,
         },
         data: {
            password: await hash(dto.password),
         },
      });

      await this.prismaService.token.delete({
         where: {
            id: existingToken.id,
            type: TokenType.PASSWORD_RESET,
         },
      });

      return {
         message: 'Пароль изменен!',
      };
   }

   //Генерация токена==================================================
   private async generateResetPasswordToken(email: string) {
      const token = uuidv4();
      const expiresIn = new Date(new Date(new Date().getTime() + 3600 * 1000));

      const existingToken = await this.prismaService.token.findFirst({
         where: {
            email,
            type: TokenType.PASSWORD_RESET,
         },
      });

      if (existingToken) {
         await this.prismaService.token.delete({
            where: {
               id: existingToken.id,
               type: TokenType.PASSWORD_RESET,
            },
         });
      }

      const resetPasswordToken = await this.prismaService.token.create({
         data: {
            email,
            token,
            expiresIn,
            type: TokenType.PASSWORD_RESET,
         },
      });

      return resetPasswordToken;
   }
}
