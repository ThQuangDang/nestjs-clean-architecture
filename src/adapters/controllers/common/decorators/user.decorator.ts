import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export interface IUser {
  id: number
  refreshToken?: string
}

export const userFactory = (
  data: keyof IUser | undefined,
  ctx: ExecutionContext,
): IUser | IUser[keyof IUser] => {
  const request = ctx.switchToHttp().getRequest<{ user: IUser }>()
  const user = request.user

  return data ? user?.[data] : user
}

/**
 * Custom decorator to retrieve the user object from the request.
 * @param data - Optional property of the user object to retrieve.
 * @param ctx - The execution context of the request.
 * @returns The user object or a specific property of the user object.
 */
export const CurrentUser = createParamDecorator(userFactory)
