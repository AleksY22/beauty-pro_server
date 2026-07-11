/* eslint-disable @typescript-eslint/require-await */
import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

//import { isDev } from '@/libs/common/utils/is-dev.util';

export const getMailerConfig = async (
   configService: ConfigService,
): Promise<MailerOptions> => ({
   transport: {
      host: configService.getOrThrow<string>('MAIL_HOST'),
      port: configService.getOrThrow<number>('MAIL_PORT'),
      // secure: !isDev(configService),
      //т.к. порт 465 закрыт на vercel будем работать на 587 для него secure: false
      secure: false,
      auth: {
         user: configService.getOrThrow<string>('MAIL_LOGIN'),
         pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
      // КРИТИЧЕСКИ ВАЖНЫЙ БЛОК ДЛЯ СВЯЗКИ VERCEL + CPANEL
      tls: {
         servername: 'mail.info-media.by',
         // Игнорируем ошибки проверки, если SSL-сертификат привязан к общему серверу cPanel
         rejectUnauthorized: false,
      },
   },
   defaults: {
      from: `${configService.getOrThrow<string>('MAIL_LOGIN')}`,
   },
});
