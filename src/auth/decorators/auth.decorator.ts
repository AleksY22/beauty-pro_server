import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Authorization(
   ...roles: (UserRole | { isOptional: boolean })[]
) {
   // Проверяем, передан ли флаг опциональной авторизации в конце аргументов
   const lastArg = roles[roles.length - 1];
   const isOptional =
      typeof lastArg === 'object' && lastArg !== null && 'isOptional' in lastArg
         ? (lastArg as { isOptional: boolean }).isOptional
         : false;

   // Очищаем массив ролей от объекта конфигурации, если он был передан
   const cleanRoles = isOptional
      ? (roles.slice(0, -1) as UserRole[])
      : (roles as UserRole[]);

   // Если переданы роли (ADMIN) — строго требуем авторизацию и роль
   if (cleanRoles.length > 0) {
      return applyDecorators(
         Roles(...cleanRoles),
         UseGuards(AuthGuard, RolesGuard),
      );
   }

   // Если указан гостевой режим — активируем мягкий OptionalAuthGuard
   if (isOptional) {
      return applyDecorators(UseGuards(OptionalAuthGuard));
   }

   return applyDecorators(UseGuards(AuthGuard));
}
