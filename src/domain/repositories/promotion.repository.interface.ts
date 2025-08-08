/* eslint-disable import/named */
import { QueryRunner } from 'typeorm'

import {
  PromotionEntity,
  PromotionStatusEnum,
} from '@domain/entities/promotions.entity'

export const PROMOTION_REPOSITORY = 'PROMOTION_REPOSITORY_INTERFACE'

export interface ISearchPromtionParam {
  status?: PromotionStatusEnum
  fromDate?: Date
  toDate?: Date
  serviceId?: number[]
  search?: string
  sortBy?: 'createdAt' | 'name' | 'discount'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  providerId?: number
}

export interface IPromotionRepository {
  findByCode(code: string): Promise<boolean>
  create(promotion: Partial<PromotionEntity>): Promise<PromotionEntity>
  updatePromotion(
    params: {
      id: number
    },
    promotion: Partial<PromotionEntity>,
  ): Promise<boolean>
  findOnPromtion(payload: {
    id: number
    providerId: number
  }): Promise<PromotionEntity | null>
  getPromotionById(id: number): Promise<PromotionEntity | null>
  findAllActive(): Promise<PromotionEntity[]>
  findPromotions(
    params: ISearchPromtionParam & { providerId?: number },
  ): Promise<PromotionEntity[]>
  findPromotionsByCodes(
    codes: string[],
    serviceId: number,
    now: Date,
  ): Promise<PromotionEntity[]>
  tryIncrementUseCountAtomically(
    promotionId: number,
    queryRunner: QueryRunner,
  ): Promise<boolean>
  decrementUseCount(
    promotionId: number,
    count: number,
    queryRunner: QueryRunner,
  ): Promise<boolean>
}
