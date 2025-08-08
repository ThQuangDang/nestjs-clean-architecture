import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { RevenueEntity } from '@domain/entities/revenues.entity'
import {
  IRevenueOutput,
  IRevenueRawRow,
  IRevenueRepository,
  ISearchRevenueParam,
} from '@domain/repositories/revenue.repository.interface'

import { Revenue } from '../entities/revenues.entity'

@Injectable()
export class RevenueRepository implements IRevenueRepository {
  constructor(
    @InjectRepository(Revenue)
    private readonly revenueRepository: Repository<Revenue>,
  ) {}

  async createRevenue(revenue: Partial<Revenue>) {
    const newRevenue = this.revenueRepository.create(revenue)
    return await this.revenueRepository.save(newRevenue)
  }

  async findByProviderIdAndMonth(providerId: number, month: Date) {
    return this.revenueRepository.findOne({
      where: { providerId, month },
    })
  }

  async updateRevenue(params: { id: number }, revenue: Partial<RevenueEntity>) {
    const upRevenue = await this.revenueRepository.update(
      {
        id: params.id,
      },
      revenue,
    )

    if (upRevenue.affected == 0) return false

    return true
  }

  async findRevenues(params: ISearchRevenueParam) {
    const query = this.revenueRepository
      .createQueryBuilder('revenue')
      .select([
        "TO_CHAR(revenue.month, 'YYYY-MM') AS month",
        'revenue.providerId AS providerId',
        'SUM(revenue.totalIncome) AS income',
        'SUM(revenue.commission) AS commission',
        'SUM(revenue.netIncome) AS netIncome',
      ])
      .groupBy('revenue.month')
      .addGroupBy('revenue.providerId')

    if (params.inDate) {
      const startOfMonth = new Date(
        params.inDate.getFullYear(),
        params.inDate.getMonth(),
        1,
      )
      const endOfMonth = new Date(
        params.inDate.getFullYear(),
        params.inDate.getMonth() + 1,
        0,
      )
      query.andWhere('revenue.month BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
    }

    if (params.providerId) {
      query.andWhere('revenue.providerId = :providerId', {
        providerId: params.providerId,
      })
    }

    query.orderBy('revenue.month', params.sortOrder)
    query.skip(params.offset).take(params.limit)

    const rawResult: IRevenueRawRow[] = await query.getRawMany()

    const groupedByMonth = new Map<string, IRevenueOutput>()

    for (const row of rawResult) {
      const month = row.month
      const income = Number(row.income)
      const commission = Number(row.commission)
      const netincome = Number(row.netincome)

      if (!groupedByMonth.has(month)) {
        groupedByMonth.set(month, {
          month,
          totalIncome: 0,
          totalCommission: 0,
          totalNetIncome: 0,
          detailsByProvider: [],
        })
      }

      const group = groupedByMonth.get(month)!
      group.totalIncome += income
      group.totalCommission += commission
      group.totalNetIncome += netincome
      group.detailsByProvider.push({
        month,
        providerid: row.providerid,
        income,
        commission,
        netincome,
      })
    }

    return Array.from(groupedByMonth.values())
  }

  async findById(id: number) {
    return await this.revenueRepository.findOne({
      where: { id },
    })
  }
}
