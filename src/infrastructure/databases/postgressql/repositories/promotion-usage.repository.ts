/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { In, QueryRunner, Repository } from 'typeorm'

import { PromotionUsageEntity } from '@domain/entities/promotions_usage.entity'
import { IPromotionUsageRepository } from '@domain/repositories/promotion-usage.repository.interface'

import { PromotionUsage } from '../entities/promotions_usage.entity'

@Injectable()
export class PromotionUsageRepository implements IPromotionUsageRepository {
  constructor(
    @InjectRepository(PromotionUsage)
    private readonly promotionUsageRepository: Repository<PromotionUsage>,
  ) {}

  async create(
    data: Partial<PromotionUsageEntity>,
    queryRunner?: QueryRunner,
  ): Promise<PromotionUsageEntity> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(PromotionUsage)
      : this.promotionUsageRepository
    const promotionUsage = repository.create(data)
    return await repository.save(promotionUsage)
  }

  async checkUniquePromotionClient(clientId: number, promotionIds: number[]) {
    return await this.promotionUsageRepository.findOne({
      where: {
        clientId,
        promotionId: In(promotionIds),
      },
    })
  }

  async getPromotionByAppointmentId(appointmentId: number[]) {
    return await this.promotionUsageRepository.find({
      where: { appointmentId: In(appointmentId) },
    })
  }

  async deleteByIds(ids: number[], queryRunner: QueryRunner) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(PromotionUsage)
      : this.promotionUsageRepository
    const removePromotion = await repository
      .createQueryBuilder()
      .delete()
      .from(PromotionUsage)
      .whereInIds(ids)
      .execute()

    if (
      removePromotion.affected === 0 ||
      removePromotion.affected !== ids.length
    )
      return false

    return true
  }
}
