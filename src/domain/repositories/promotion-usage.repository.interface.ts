/* eslint-disable import/named */
import { QueryRunner } from 'typeorm'

import { PromotionUsageEntity } from '@domain/entities/promotions_usage.entity'

export const PROMOTION_USAGE_REPOSITORY = 'PROMOTION_USAGE_REPOSITORY_INTERFACE'

export interface IPromotionUsageRepository {
  create(
    data: Partial<PromotionUsageEntity>,
    queryRunner?: QueryRunner,
  ): Promise<PromotionUsageEntity>
  checkUniquePromotionClient(
    clientId: number,
    promotionIds: number[],
  ): Promise<PromotionUsageEntity | null>
  getPromotionByAppointmentId(
    appointmentId: number[],
  ): Promise<PromotionUsageEntity[]>
  deleteByIds(ids: number[], queryRunner: QueryRunner): Promise<boolean>
}
