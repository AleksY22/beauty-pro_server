/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
   public constructor(private readonly userService: UserService) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      if (!request.session || typeof request.session.userId === 'undefined') {
         throw new UnauthorizedException(
            'Пользователь не авторизован! Войдите в систему.',
         );
      }

      const user = await this.userService.getById(request.session.userId);

      // Защита от кейса, когда сессия есть, но юзер удален из БД
      if (!user) {
         throw new UnauthorizedException(
            'Сессия недействительна. Пользователь не найден.',
         );
      }

      request.user = user;

      return true;
   }
}
