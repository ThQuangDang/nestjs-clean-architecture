import { Inject, Injectable } from '@nestjs/common'

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
export class CreatePromotionUseCase {
  constructor(
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(PROMOTION_SERVICE_REPOSITORY)
    private readonly promotionServiceRepository: IPromotionServiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: {
    userId: number
    name: string
    discount: number
    discountCode: string
    maxUsage: number
    startDate: Date
    endDate: Date
    serviceIds: number[]
  }) {
    await this.checkDiscountCodeExist(payload.discountCode)

    const provider = await this.validateProvider(payload.userId)

    await this.validateService(provider.id, payload.serviceIds)

    const promotion = await this.promotionRepository.create({
      providerId: provider.id,
      name: payload.name,
      discount: payload.discount,
      discountCode: payload.discountCode,
      maxUsage: payload.maxUsage,
      startDate: payload.startDate,
      endDate: payload.endDate,
    })

    const promotionServices = payload.serviceIds.map((serviceId) =>
      this.promotionServiceRepository.create({
        promotionId: promotion.id,
        serviceId,
      }),
    )

    await this.promotionServiceRepository.save(promotionServices)

    return {
      ...promotion,
      serviceIds: payload.serviceIds,
    }
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

  private async validateProvider(userId: number) {
    const provider = await this.providerRepository.findProviderByUserId(userId)

    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Provider not found',
      })
    }

    return provider
  }

  private async validateService(providerId: number, serviceIds: number[]) {
    const services = await this.serviceRepository.findValidServicesByIds(
      serviceIds,
      providerId,
    )

    if (services.length !== serviceIds.length) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Some services are invalid or inactive',
      })
    }
  }
}
