/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
   public constructor(private readonly userService: UserService) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      // 1. Если в сессии нет ID пользователя, мы не падаем с ошибкой, а просто пропускаем гостя
      if (typeof request.session.userId === 'undefined') {
         return true;
      }

      try {
         // 2. Если ID есть, подтягиваем пользователя из БД, как и в основном AuthGuard
         const user = await this.userService.getById(request.session.userId);
         request.user = user;
      } catch {
         // На случай, если в сессии остался "битый" ID несуществующего пользователя
         request.user = undefined;
      }

      return true;
   }
}
