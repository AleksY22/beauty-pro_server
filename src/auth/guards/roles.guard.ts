/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
   public constructor(private readonly reflector: Reflector) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);
      const request = context.switchToHttp().getRequest();

      if (!roles) return true;

      if (!roles.includes(request.user.role)) {
         throw new ForbiddenException('Недостатчно прав доступа!');
      }
      return true;
   }
}
