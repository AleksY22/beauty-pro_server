/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../generated/prisma/client';

export const Authorized = createParamDecorator(
   (data: keyof User | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user as User;

      if (!user) return null;

      return data ? user[data] : user;
   },
);
