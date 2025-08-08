import { Inject, Injectable } from '@nestjs/common'

import { PromotionStatusEnum } from '@domain/entities/promotions.entity'
import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IPromotionRepository,
  ISearchPromtionParam,
  PROMOTION_REPOSITORY,
} from '@domain/repositories/promotion.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListPromotionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchPromtionParam & { userId: number }) {
    const user = await this.checkUser(queryParams.userId)

    let providerId: number | undefined = queryParams.providerId
    let status: PromotionStatusEnum | undefined = queryParams.status

    if (user.role === RoleEnum.ADMIN) {
      providerId = queryParams.providerId
      status = queryParams.status
    } else if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.checkProvider(user.id)

      providerId = provider.id
    } else if (user.role === RoleEnum.CLIENT) {
      providerId = undefined
      status = PromotionStatusEnum.ACTIVE
    }

    const promotion = await this.promotionRepository.findPromotions({
      ...queryParams,
      providerId,
      status,
    })

    return promotion
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'User not found',
      })
    }

    return user
  }

  private async checkProvider(userId: number) {
    const provider = await this.providerRepository.findProviderByUserId(userId)
    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Provider not found',
      })
    }
    return provider
  }
}
