import { PromotionServiceEntity } from '@domain/entities/promotions_services.entity'

export const PROMOTION_SERVICE_REPOSITORY =
  'PROMOTION_SERVICE_REPOSITORY_INTERFACE'

export interface IPromotionServiceRepository {
  create(data: Partial<PromotionServiceEntity>): PromotionServiceEntity
  save(
    entity: PromotionServiceEntity | PromotionServiceEntity[],
  ): Promise<PromotionServiceEntity[]>
  findServiceTdsByPromotionId(promotionId: number): Promise<number[]>
  delete(payload: { promotionId: number; serviceId: number }): Promise<void>
}
