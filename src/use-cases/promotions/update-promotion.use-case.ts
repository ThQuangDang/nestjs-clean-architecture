import { Inject, Injectable } from '@nestjs/common'

import { PromotionEntity } from '@domain/entities/promotions.entity'
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
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'

@Injectable()
export class UpdatePromotionUseCase {
  constructor(
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(PROMOTION_SERVICE_REPOSITORY)
    private readonly promotionServiceRepository: IPromotionServiceRepository,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { id: number; userId: number },
    promotionPayload: Partial<PromotionEntity> & { serviceIds?: number[] },
  ): Promise<boolean> {
    const { id: promotionId, userId } = params
    const { serviceIds, discountCode, ...restPayload } = promotionPayload
    let updated = false

    const provider = await this.checkProvider(userId)

    await this.checkPromotionExistence({
      id: promotionId,
      providerId: provider.id,
    })

    if (discountCode) {
      await this.checkDiscountCodeExist(discountCode)
    }

    if (serviceIds) {
      await this.validateServices(provider.id, serviceIds)

      await this.updatePromotionServices(promotionId, serviceIds)
    }
    updated = true

    if (Object.keys(restPayload).length > 0 || discountCode) {
      updated = await this.promotionRepository.updatePromotion(
        { id: promotionId },
        { ...restPayload, discountCode },
      )
    }

    return updated
  }

  private async checkPromotionExistence({
    id,
    providerId,
  }: {
    id: number
    providerId: number
  }) {
    const promotion = await this.promotionRepository.findOnPromtion({
      id: id,
      providerId: providerId,
    })

    if (!promotion) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Promotion not found',
      })
    }

    return promotion
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

  private async checkDiscountCodeExist(discountCode: string) {
    const existing = await this.promotionRepository.findByCode(discountCode)

    if (existing) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Discount code already exist',
      })
    }
  }

  private async validateServices(providerId: number, serviceIds: number[]) {
    const validServices = await this.serviceRepository.findValidServicesByIds(
      serviceIds,
      providerId,
    )

    if (validServices.length !== serviceIds.length) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Some services are invalid or inactive',
      })
    }
  }

  private async updatePromotionServices(
    promotionId: number,
    newServiceIds: number[],
  ) {
    const oldServiceIds =
      await this.promotionServiceRepository.findServiceTdsByPromotionId(
        promotionId,
      )

    const oldIds = oldServiceIds.map(Number)
    const newIds = newServiceIds.map(Number)

    const toRemove = oldIds.filter((id) => !newIds.includes(id))
    const toAdd = newIds.filter((id) => !oldIds.includes(id))

    if (toRemove.length) {
      await Promise.all(
        toRemove.map((id) =>
          this.promotionServiceRepository.delete({
            promotionId,
            serviceId: id,
          }),
        ),
      )
    }

    if (toAdd.length) {
      const newPromotionServices = toAdd.map((serviceId) =>
        this.promotionServiceRepository.create({
          promotionId,
          serviceId,
        }),
      )
      await this.promotionServiceRepository.save(newPromotionServices)
    }
  }
}
