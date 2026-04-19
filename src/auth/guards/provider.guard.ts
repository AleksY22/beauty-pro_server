/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
   CanActivate,
   ExecutionContext,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProviderService } from '../provider/provider.service';

@Injectable()
export class AuthProviderGuard implements CanActivate {
   public constructor(private readonly providerService: ProviderService) {}

   public canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest() as Request;

      const providerRaw = request.params.provider;

      const provider = Array.isArray(providerRaw)
         ? providerRaw[0] // берем первый элемент, если пришел массив
         : providerRaw; // иначе это уже строка

      const providerInstance = this.providerService.findByService(provider);

      if (!providerInstance) {
         throw new NotFoundException(
            `Провайдер '${provider}' не найден! Проверьте правильность введенных данных.`,
         );
      }
      return true;
   }
}
