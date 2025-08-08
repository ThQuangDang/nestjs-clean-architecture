import { ApiProperty } from '@nestjs/swagger'

export class CreatePromotionPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  discount: number

  @ApiProperty()
  discountCode: string

  @ApiProperty()
  maxUsage: number

  @ApiProperty()
  useCount: number

  @ApiProperty()
  startDate: Date

  @ApiProperty()
  endDate: Date

  @ApiProperty({ type: [Number] })
  serviceIds: number[]

  constructor({
    id,
    name,
    discount,
    discountCode,
    maxUsage,
    useCount,
    startDate,
    endDate,
    serviceIds,
  }: CreatePromotionPresenter) {
    this.id = id
    this.name = name
    this.discount = discount
    this.discountCode = discountCode
    this.maxUsage = maxUsage
    this.useCount = useCount
    this.startDate = startDate
    this.endDate = endDate
    this.serviceIds = serviceIds
  }
}
