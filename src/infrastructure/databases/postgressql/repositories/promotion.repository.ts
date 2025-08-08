/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { QueryRunner, Repository } from 'typeorm'

import {
  PromotionEntity,
  PromotionStatusEnum,
} from '@domain/entities/promotions.entity'
import {
  IPromotionRepository,
  ISearchPromtionParam,
} from '@domain/repositories/promotion.repository.interface'

import { Promotion } from '../entities/promotions.entity'

@Injectable()
export class PromotionRepository implements IPromotionRepository {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async findByCode(code: string) {
    return await this.promotionRepository.exists({
      where: { discountCode: code },
    })
  }

  async create(promotion: Partial<PromotionEntity>) {
    const newPromotion = this.promotionRepository.create(promotion)

    return await this.promotionRepository.save(newPromotion)
  }
  async updatePromotion(
    params: { id: number },
    promotion: Partial<PromotionEntity>,
  ) {
    const upPromotion = await this.promotionRepository.update(
      {
        id: params.id,
      },
      promotion,
    )

    if (upPromotion.affected === 0) return false

    return true
  }

  async findOnPromtion(payload: { id: number; providerId: number }) {
    return await this.promotionRepository.findOne({
      where: {
        id: payload.id,
        providerId: payload.providerId,
      },
    })
  }

  async getPromotionById(id: number) {
    return await this.promotionRepository.findOne({
      where: { id: id },
    })
  }

  async findAllActive() {
    return await this.promotionRepository.find({
      where: { status: PromotionStatusEnum.ACTIVE },
      select: ['id', 'endDate', 'maxUsage', 'useCount'],
    })
  }

  async findPromotions(params: ISearchPromtionParam & { providerId?: number }) {
    const query = this.promotionRepository
      .createQueryBuilder('promotions')
      .leftJoin('promotions.promotionServices', 'ps')
      .select([
        'promotions.id',
        'promotions.name',
        'promotions.discount',
        'promotions.discountCode',
        'promotions.startDate',
        'promotions.endDate',
        'promotions.status',
        'promotions.providerId',
        'promotions.createdAt',
      ])

    if (params.providerId) {
      query.andWhere('promotions.providerId = :providerId', {
        providerId: params.providerId,
      })
    }

    if (params.status) {
      query.andWhere('promotions.status = :status', { status: params.status })
    }

    if (params.fromDate) {
      query.andWhere('promotions.startDate >= :fromDate', {
        fromDate: params.fromDate,
      })
    }

    if (params.toDate) {
      query.andWhere('promotions.endDate <= :toDate', {
        toDate: params.toDate,
      })
    }

    if (params.serviceId && params.serviceId.length > 0) {
      query.andWhere('ps.serviceId IN (:...serviceIds)', {
        serviceIds: params.serviceId,
      })
      query.groupBy('promotions.id')
      query.having('COUNT(DISTINCT ps.serviceId) = :serviceIdCount', {
        serviceIdCount: params.serviceId.length,
      })
    }

    if (params.search?.trim()) {
      query.andWhere(
        '(promotions.name ILIKE :search OR promotions.discountCode ILIKE :search)',
        { search: `%${params.search}%` },
      )
    }

    query.orderBy(`promotions.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }

  async findPromotionsByCodes(codes: string[], serviceId: number, now: Date) {
    return this.promotionRepository
      .createQueryBuilder('promotions')
      .leftJoin('promotions.promotionServices', 'ps')
      .select([
        'promotions.id',
        'promotions.discount',
        'promotions.discountCode',
        'promotions.startDate',
        'promotions.endDate',
        'promotions.status',
        'promotions.useCount',
        'promotions.maxUsage',
      ])
      .where('promotions.discountCode IN (:...codes)', { codes })
      .andWhere('ps.serviceId = :serviceId', { serviceId })
      .andWhere('promotions.startDate <= :now AND promotions.endDate >= :now', {
        now,
      })
      .andWhere('promotions.status = :status', {
        status: PromotionStatusEnum.ACTIVE,
      })
      .getMany()
  }

  async tryIncrementUseCountAtomically(
    promotionId: number,
    queryRunner: QueryRunner,
  ) {
    const repository = queryRunner.manager.getRepository(Promotion)

    const updatePromotion = await repository
      .createQueryBuilder('promotion')
      .update(Promotion)
      .set({ useCount: () => 'useCount + 1' })
      .where('id = :id', { id: promotionId })
      .andWhere('useCount < maxUsage')
      .execute()

    if (updatePromotion.affected === 0) return false

    return true
  }

  async decrementUseCount(
    promotionId: number,
    count: number,
    queryRunner: QueryRunner,
  ) {
    const repository = queryRunner.manager.getRepository(Promotion)

    const updatePromotion = await repository
      .createQueryBuilder()
      .update(Promotion)
      .set({ useCount: () => `useCount - ${count}` })
      .where('id = :id', { id: promotionId })
      .andWhere('useCount >= :count', { count })
      .execute()

    if (updatePromotion.affected === 0) return false

    return true
  }
}
