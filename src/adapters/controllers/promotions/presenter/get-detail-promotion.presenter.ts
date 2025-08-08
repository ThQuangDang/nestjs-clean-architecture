import { ApiProperty, PickType } from '@nestjs/swagger'

import { PromotionStatusEnum } from '@domain/entities/promotions.entity'

import { CreatePromotionPresenter } from './create-promotion.presenter'

export class GetDetailPromotionPresenter extends PickType(
  CreatePromotionPresenter,
  ['id', 'name', 'discount', 'discountCode', 'startDate', 'endDate'],
) {
  @ApiProperty({
    required: false,
    enum: PromotionStatusEnum,
    description: '1: ACTIVE, 2: EXPRIED',
  })
  status?: PromotionStatusEnum

  @ApiProperty({
    required: false,
    description: 'Max number promoion used',
  })
  maxUsage?: number

  @ApiProperty({
    required: false,
    description: 'Promotion by user used',
  })
  useCount?: number

  @ApiProperty({ type: [Number] })
  serviceIds?: number[]

  constructor({
    id,
    name,
    discount,
    discountCode,
    startDate,
    endDate,
    serviceIds,
    status,
    maxUsage,
    useCount,
  }: GetDetailPromotionPresenter) {
    super()
    this.id = id
    this.name = name
    this.discount = discount
    this.discountCode = discountCode
    this.startDate = startDate
    this.endDate = endDate
    this.serviceIds = serviceIds
    this.status = status
    this.maxUsage = maxUsage
    this.useCount = useCount
  }
}
