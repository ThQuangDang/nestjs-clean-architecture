import { Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { PromotionStatusEnum } from '@domain/entities/promotions.entity'
import {
  IPromotionRepository,
  PROMOTION_REPOSITORY,
} from '@domain/repositories/promotion.repository.interface'

export class PromotionCronService {
  constructor(
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  @Cron('0 0 0 * * *')
  async updatePromotionStatuses() {
    const now = new Date()
    const promotion = await this.promotionRepository.findAllActive()

    for (const promo of promotion) {
      const endDate = new Date(promo.endDate)
      const isExpired = endDate < now || promo.useCount >= promo.maxUsage
      if (isExpired) {
        await this.promotionRepository.updatePromotion(
          {
            id: promo.id,
          },
          {
            status: PromotionStatusEnum.EXPIRED,
          },
        )
      }
    }
  }
}
