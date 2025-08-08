import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreatePromotionServiceDto {
  @ApiProperty({
    required: true,
    description: 'service id',
  })
  @IsNotEmpty()
  @IsNumber()
  serviceId!: number
}
