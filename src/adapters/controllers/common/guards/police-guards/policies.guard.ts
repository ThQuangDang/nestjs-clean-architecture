import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { checkPoliciesKey } from '@decorators/police-handler/check-policies.decorator'
import { TPolicyHandler } from '@decorators/police-handler/policy-handler'
import { Request } from 'express'

import {
  CaslAbilityFactory,
  TAppAbility,
} from '@infrastructure/common/permisions/casl-ability.factory'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

@Injectable()
export class PolicesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyHandlers =
      this.reflector.getAllAndOverride<TPolicyHandler[]>(checkPoliciesKey, [
        context.getHandler(),
        context.getClass(),
      ]) || []

    const request = context.switchToHttp().getRequest<Request>()
    const user: User = request.user as User
    const ability = this.caslAbilityFactory.createForUser(user)

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    )
  }

  private execPolicyHandler(handler: TPolicyHandler, ability: TAppAbility) {
    if (typeof handler === 'function') {
      return handler(ability)
    }
    return handler.handle(ability)
  }
}
