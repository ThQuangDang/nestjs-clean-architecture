import { SetMetadata } from '@nestjs/common'

import { TPolicyHandler } from './policy-handler'

export const checkPoliciesKey = 'check_policy'
export const CheckPolicies = (...handlers: TPolicyHandler[]) => {
  return SetMetadata(checkPoliciesKey, handlers)
}
