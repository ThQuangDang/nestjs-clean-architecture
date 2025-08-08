import { Inject, Injectable } from '@nestjs/common'

import {
  PromotionEntity,
  PromotionStatusEnum,
} from '@domain/entities/promotions.entity'
import { RoleEnum, UserEntity } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IPromotionServiceRepository,
  PROMOTION_SERVICE_REPOSITORY,
} from '@domain/repositories/promotion-service.repository.interface'
import {
  IPromotionRepository,
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
export class GetDetailPromotionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(PROMOTION_SERVICE_REPOSITORY)
    private readonly promotionServiceRepository: IPromotionServiceRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: { promotionId: number; userId: number }) {
    const user = await this.checkUser(params.userId)
    return await this.getDetailPromotion(params.promotionId, user)
  }

  private async checkPromotion(id: number) {
    const promotion = await this.promotionRepository.getPromotionById(id)

    if (!promotion) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Promotion not found',
      })
    }

    return promotion
  }

  private async checkPromotionService(id: number) {
    const serviceIds =
      await this.promotionServiceRepository.findServiceTdsByPromotionId(id)

    if (serviceIds.length === 0) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Service not found',
      })
    }

    return serviceIds
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

  private async getDetailPromotion(id: number, user: UserEntity) {
    const promotion = await this.checkPromotion(id)

    const promotionServiceIds = await this.checkPromotionService(id)

    if (user.role === RoleEnum.ADMIN) {
      return {
        ...promotion,
        serviceIds: promotionServiceIds,
      }
    }

    if (user.role === RoleEnum.PROVIDER) {
      await this.checkProvider(user.id, promotion)
      return {
        ...promotion,
        serviceIds: promotionServiceIds,
      }
    }

    if (promotion.status !== PromotionStatusEnum.ACTIVE) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view active promotion.',
      })
    }

    return {
      id: promotion.id,
      name: promotion.name,
      discount: promotion.discount,
      discountCode: promotion.discountCode,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      serviceIds: promotionServiceIds,
      status: promotion.status,
    }
  }

  private async checkProvider(userId: number, promotion: PromotionEntity) {
    const provider = await this.providerRepository.findProviderByUserId(userId)

    const isOwner = provider && promotion.providerId === provider.id

    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You do not have permission to access this promotion',
      })
    }
  }
}
