import { ApiProperty } from '@nestjs/swagger'

import { ServiceStatusEnum } from '@domain/entities/services.entity'

export class CreateServicePresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty()
  price: number

  @ApiProperty({
    required: true,
    enum: ServiceStatusEnum,
    description: '1: ACTIVE, 2: INACTIVE',
  })
  status: ServiceStatusEnum

  constructor({
    id,
    name,
    description,
    price,
    status,
  }: CreateServicePresenter) {
    this.id = id
    this.name = name
    this.description = description
    this.price = price
    this.status = status
  }
}
