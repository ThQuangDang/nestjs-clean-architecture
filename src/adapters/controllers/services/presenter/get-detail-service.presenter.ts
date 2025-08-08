import { ApiProperty, PickType } from '@nestjs/swagger'

import { ServiceStatusEnum } from '@domain/entities/services.entity'

import { CreateServicePresenter } from './create-service.presenter'

export class GetDetailServicePresenter extends PickType(
  CreateServicePresenter,
  ['id', 'description', 'name', 'price'],
) {
  @ApiProperty({
    required: false,
    enum: ServiceStatusEnum,
    description: '1: ACTIVE, 2: INACTIVE',
  })
  status: ServiceStatusEnum

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Start date create service',
  })
  createdAt?: Date

  @ApiProperty({
    required: false,
    description: 'Rating for service',
  })
  rating: number

  @ApiProperty({
    required: false,
    description: 'Provider create service',
  })
  providerId: number

  constructor({
    id,
    name,
    description,
    price,
    status,
    rating,
    createdAt,
    providerId,
  }: GetDetailServicePresenter) {
    super()
    this.id = id
    this.description = description
    this.name = name
    this.price = price
    this.status = status
    this.rating = rating
    this.createdAt = createdAt
    this.providerId = providerId
  }
}
