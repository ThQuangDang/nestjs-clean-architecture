import { RevenueEntity } from '@domain/entities/revenues.entity'

export const REVENUE_REPOSITORY = 'REVENUES_REPOSITORY_INTERFACE'

export interface ISearchRevenueParam {
  inDate?: Date
  providerId?: number
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

export interface IRevenueOutput {
  month: string
  totalIncome: number
  totalCommission: number
  totalNetIncome: number
  detailsByProvider: IRevenueRawRow[]
}

export interface IRevenueRawRow {
  month: string
  providerid: string
  income: number
  commission: number
  netincome: number
}

export interface IRevenueRepository {
  createRevenue(revenue: Partial<RevenueEntity>): Promise<RevenueEntity>
  findByProviderIdAndMonth(
    providerId: number,
    month: Date,
  ): Promise<RevenueEntity | null>
  updateRevenue(
    params: {
      id: number
    },
    revenue: Partial<RevenueEntity>,
  ): Promise<boolean>
  findRevenues(params: ISearchRevenueParam): Promise<IRevenueOutput[]>
  findById(id: number): Promise<RevenueEntity | null>
}
