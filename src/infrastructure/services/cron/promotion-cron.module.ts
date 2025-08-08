import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PROMOTION_REPOSITORY } from '@domain/repositories/promotion.repository.interface'

import { Promotion } from '@infrastructure/databases/postgressql/entities/promotions.entity'
import { PromotionRepository } from '@infrastructure/databases/postgressql/repositories/promotion.repository'

import { PromotionCronService } from './promotion-cron.service'

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  providers: [
    {
      provide: PROMOTION_REPOSITORY,
      useClass: PromotionRepository,
    },
    PromotionCronService,
  ],
})
export class PromotionCronModule {}
