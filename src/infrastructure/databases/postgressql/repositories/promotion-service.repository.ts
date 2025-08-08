import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { PromotionServiceEntity } from '@domain/entities/promotions_services.entity'
import { IPromotionServiceRepository } from '@domain/repositories/promotion-service.repository.interface'

import { PromotionsServices } from '../entities/promotions_services.entity'

@Injectable()
export class PromotionServiceRepository implements IPromotionServiceRepository {
  constructor(
    @InjectRepository(PromotionsServices)
    private readonly promotionServiceRepository: Repository<PromotionsServices>,
  ) {}

  create(data: Partial<PromotionServiceEntity>) {
    return this.promotionServiceRepository.create(data)
  }

  async save(
    entities: PromotionServiceEntity | PromotionServiceEntity[],
  ): Promise<PromotionServiceEntity[]> {
    return Array.isArray(entities)
      ? this.promotionServiceRepository.save(entities)
      : this.promotionServiceRepository.save([entities])
  }
  async findServiceTdsByPromotionId(promotionId: number) {
    const records = await this.promotionServiceRepository.find({
      where: { promotionId },
      select: ['serviceId'],
    })

    return records.map((r) => r.serviceId)
  }
  async delete(payload: { promotionId: number; serviceId: number }) {
    await this.promotionServiceRepository.delete({
      promotionId: payload.promotionId,
      serviceId: payload.serviceId,
    })
  }
}
