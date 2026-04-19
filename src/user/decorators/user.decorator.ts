/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../generated/prisma/client';

export const CurrentUser = createParamDecorator(
   (data: keyof User, context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      return data ? user[data] : user;
   },
);
