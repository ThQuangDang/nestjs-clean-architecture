import { TAppAbility } from '@infrastructure/common/permisions/casl-ability.factory'

interface IPolicyHandler {
  handle(ability: TAppAbility): boolean
}

type TPolicyHandlerCallback = (ability: TAppAbility) => boolean

export type TPolicyHandler = IPolicyHandler | TPolicyHandlerCallback
