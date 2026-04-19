import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { TokenType } from '../../generated/prisma/enums';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TwoFactorAuthService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly mailService: MailService,
   ) {}

   //Валидация токена=========================================================
   public async validateTwoFactorToken(email: string, code: string) {
      const existingToken = await this.prismaService.token.findFirst({
         where: {
            email,
            type: TokenType.TWO_FACTOR,
         },
      });

      if (!existingToken) {
         throw new NotFoundException(
            'Токен двухфакторной аутентификации не найден!',
         );
      }

      if (existingToken.token !== code) {
         throw new BadRequestException(
            'Неверный код двухфакторной аутентификации! Проверьте введенный код.',
         );
      }

      const hasExpired = new Date(existingToken.expiresIn) < new Date();

      if (hasExpired) {
         throw new BadRequestException(
            'Срок действия токена двухфакторной аутентификации истек! Запросите новый токен.',
         );
      }

      await this.prismaService.token.delete({
         where: {
            id: existingToken.id,
            type: TokenType.TWO_FACTOR,
         },
      });

      return true;
   }

   //Отправка токена=======================================================
   public async sendTwoFactorToken(email: string) {
      const twoFactorToken = await this.generateTwoFactorToken(email);

      await this.mailService.sendTwoFactorToken(
         twoFactorToken.email,
         twoFactorToken.token,
      );

      return true;
   }

   //Генерация токена====================================================
   private async generateTwoFactorToken(email: string) {
      const token = Math.floor(
         Math.random() * (1000000 - 100000) + 100000,
      ).toString();
      const expiresIn = new Date(new Date(new Date().getTime() + 300000));

      const existingToken = await this.prismaService.token.findFirst({
         where: {
            email,
            type: TokenType.TWO_FACTOR,
         },
      });

      if (existingToken) {
         await this.prismaService.token.delete({
            where: {
               id: existingToken.id,
               type: TokenType.TWO_FACTOR,
            },
         });
      }

      const twoFactorToken = await this.prismaService.token.create({
         data: {
            email,
            token,
            expiresIn,
            type: TokenType.TWO_FACTOR,
         },
      });

      return twoFactorToken;
   }
}
