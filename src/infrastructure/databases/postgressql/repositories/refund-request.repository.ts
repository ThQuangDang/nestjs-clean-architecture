import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { endOfDay, startOfDay } from 'date-fns'
import { Repository } from 'typeorm'

import { RefundStatusEnum } from '@domain/entities/refund_request.entity'
import {
  IRefundRequestRepository,
  ISearchRefundRequestParams,
} from '@domain/repositories/refund-request.repository.interface'

import { RefundRequest } from '../entities/refund_request.entity'

@Injectable()
export class RefundRequestRepository implements IRefundRequestRepository {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestRepository: Repository<RefundRequest>,
  ) {}

  async createRefundRequest(data: Partial<RefundRequest>) {
    const refundRequest = this.refundRequestRepository.create(data)
    return await this.refundRequestRepository.save(refundRequest)
  }

  async findLastestByInvoiceId(invoiceId: number) {
    return await this.refundRequestRepository.findOne({
      where: { invoiceId },
      order: { createdAt: 'DESC' },
    })
  }

  async countRetryByInvoiceAndClient(invoiceId: number, clientId: number) {
    return await this.refundRequestRepository.count({
      where: {
        invoiceId,
        clientId,
      },
    })
  }

  async updateRefundRequestStatus(
    id: number,
    status: RefundStatusEnum,
    userId: number,
    rejectReason?: string,
  ): Promise<boolean> {
    const updateResult = await this.refundRequestRepository.update(id, {
      refundStatus: status,
      userId,
      rejectReason,
    })
    return updateResult.affected !== undefined && updateResult.affected > 0
  }

  async findById(id: number) {
    return await this.refundRequestRepository.findOne({
      where: { id },
    })
  }

  async findRefundRequest(params: ISearchRefundRequestParams) {
    const query = this.refundRequestRepository
      .createQueryBuilder('refundRequest')
      .select([
        'refundRequest.id',
        'refundRequest.invoiceId',
        'refundRequest.clientId',
        'refundRequest.refundReason',
        'refundRequest.refundStatus',
        'refundRequest.rejectReason',
        'refundRequest.createdAt',
      ])

    if (params.clientId) {
      query.andWhere('refundRequest.clientId = :clientId', {
        clientId: params.clientId,
      })
    }

    if (params.invoiceId) {
      query.andWhere('refundRequest.invoiceId = :invoiceId', {
        invoiceId: params.invoiceId,
      })
    }

    if (params.refundStatus) {
      query.andWhere('refundRequest.refundStatus = :refundStatus', {
        refundStatus: params.refundStatus,
      })
    }

    if (params.search?.trim()) {
      query.andWhere('(refundRequest.refundReason ILIKE :search)', {
        search: `%${params.search}%`,
      })
    }

    if (params.inDate) {
      const startDate = startOfDay(params.inDate)
      const endDate = endOfDay(params.inDate)
      query.andWhere(
        'refundRequest.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      )
    }

    query.orderBy(`refundRequest.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)
    return query.getMany()
  }
}
