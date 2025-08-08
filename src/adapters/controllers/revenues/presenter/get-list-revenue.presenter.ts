import { ApiProperty } from '@nestjs/swagger'

import { IRevenueOutput } from '@domain/repositories/revenue.repository.interface'

import { RevenueDetailProviderPresenter } from './revenue-detail-provider.presenter'

export class GetListRevenuePresenter implements IRevenueOutput {
  @ApiProperty()
  month: string

  @ApiProperty()
  totalIncome: number

  @ApiProperty()
  totalCommission: number

  @ApiProperty()
  totalNetIncome: number

  @ApiProperty({ type: [RevenueDetailProviderPresenter] })
  detailsByProvider: RevenueDetailProviderPresenter[]

  constructor(data: IRevenueOutput) {
    this.month = data.month
    this.totalIncome = data.totalIncome
    this.totalCommission = data.totalCommission
    this.totalNetIncome = data.totalNetIncome
    this.detailsByProvider = data.detailsByProvider.map(
      (item) => new RevenueDetailProviderPresenter(item),
    )
  }
}
