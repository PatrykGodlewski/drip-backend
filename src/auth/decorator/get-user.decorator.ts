import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator((data: keyof Omit<User, 'hashedPassword'>, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest() satisfies { user: Omit<User, 'hashedPassword'> };
  if (data) {
    return request.user[data];
  }
  return request.user;
});
