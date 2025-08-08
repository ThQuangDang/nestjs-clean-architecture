import { ApiProperty } from '@nestjs/swagger'

export class GetDetailRevenuePresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  totalIncome: number

  @ApiProperty()
  commission: number

  @ApiProperty()
  netIncome: number

  @ApiProperty()
  month: Date

  @ApiProperty()
  providerId: number

  constructor({
    id,
    totalIncome,
    commission,
    netIncome,
    month,
    providerId,
  }: GetDetailRevenuePresenter) {
    this.id = id
    this.totalIncome = totalIncome
    this.commission = commission
    this.netIncome = netIncome
    this.month = month
    this.providerId = providerId
  }
}
