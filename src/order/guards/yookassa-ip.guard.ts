/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   Injectable,
} from '@nestjs/common';
import ipRangeCheck from 'ip-range-check';

@Injectable()
export class YookassaIpGuard implements CanActivate {
   // Официальный список подсетей ЮKassa для отправки вебхуков
   private readonly yookassaIpRanges = [
      '185.71.76.0/27',
      '185.71.77.0/27',
      '77.75.153.0/25',
      '77.75.156.128/25',
      '77.75.156.35',
      '77.75.154.128/25',
      '2a02:5180::/32', // IPv6 подсеть ЮKassa
   ];

   canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();

      // Извлекаем IP (с учетом проксирования, например, Nginx / Cloudflare)
      const ip =
         request.headers['x-forwarded-for']?.split(',')[0].trim() ||
         request.socket.remoteAddress;

      if (!ip) {
         throw new ForbiddenException(
            'Не удалось определить IP-адрес отправителя',
         );
      }

      // Проверяем, входит ли IP-запроса в разрешенные диапазоны ЮKassa
      const isAllowed = ipRangeCheck(ip, this.yookassaIpRanges);

      if (!isAllowed) {
         console.warn(`[WARNING] Попытка подделки вебхука с IP: ${ip}`);
         throw new ForbiddenException(
            'Доступ запрещен. Неверный источник запроса.',
         );
      }

      return true;
   }
}
