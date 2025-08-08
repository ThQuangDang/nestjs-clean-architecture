import { ApiProperty, PartialType } from '@nestjs/swagger'

import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'

import { PromotionStatusEnum } from '@domain/entities/promotions.entity'

import { CreatePromotionDto } from './create-promotion.dto'

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  @ApiProperty({
    required: false,
    enum: PromotionStatusEnum,
    description: '1: ACTIVE, 2: EXPIRED',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(PromotionStatusEnum)
  @IsOptional()
  status?: PromotionStatusEnum
}
