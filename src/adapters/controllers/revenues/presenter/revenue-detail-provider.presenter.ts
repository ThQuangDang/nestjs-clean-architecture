import { ApiProperty } from '@nestjs/swagger'

import { IRevenueRawRow } from '@domain/repositories/revenue.repository.interface'

export class RevenueDetailProviderPresenter implements IRevenueRawRow {
  @ApiProperty()
  month: string

  @ApiProperty()
  providerid: string

  @ApiProperty()
  income: number

  @ApiProperty()
  commission: number

  @ApiProperty()
  netincome: number

  constructor(row: IRevenueRawRow) {
    this.month = row.month
    this.providerid = row.providerid
    this.income = row.income
    this.commission = row.commission
    this.netincome = row.netincome
  }
}
