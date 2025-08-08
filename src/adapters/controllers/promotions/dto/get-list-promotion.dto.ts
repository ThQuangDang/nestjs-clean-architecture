import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator'

import { PromotionStatusEnum } from '@domain/entities/promotions.entity'
import { ISearchPromtionParam } from '@domain/repositories/promotion.repository.interface'

export class GetListPromotionDto implements ISearchPromtionParam {
  @ApiProperty({
    required: false,
    enum: PromotionStatusEnum,
    description: '1: ACITVE, 2: EXPIRED',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsOptional()
  @IsEnum(PromotionStatusEnum)
  status?: PromotionStatusEnum

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Filter promotions starting on or after this date',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  fromDate?: Date

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Filter promotions ending on or before this date',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  toDate?: Date

  @ApiProperty({
    required: false,
    description: 'Filter promotions linked to the given service IDs',
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }: { value: string | string[] }) =>
    typeof value === 'string' ? [Number(value)] : value.map(Number),
  )
  serviceId?: number[]

  @ApiProperty({
    required: false,
    minLength: 3,
  })
  @MinLength(3)
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({
    required: false,
    enum: ['createdAt', 'name', 'discount'],
  })
  @IsIn(['createdAt', 'name', 'discount'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'discount' = 'createdAt'

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  providerId?: number
}
