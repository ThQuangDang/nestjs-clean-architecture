import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator'

import { RefundStatusEnum } from '@domain/entities/refund_request.entity'
import { ISearchRefundRequestParams } from '@domain/repositories/refund-request.repository.interface'

export class GetListRequestRefundDto implements ISearchRefundRequestParams {
  @ApiProperty({
    required: false,
    enum: RefundStatusEnum,
    description: '1 = NONE, 2 = PENDING, 3 = APPROVED, 4 = REJECTED,',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsOptional()
  @IsEnum(RefundStatusEnum)
  refundStatus?: RefundStatusEnum

  @ApiProperty({
    required: false,
    type: Date,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  inDate?: Date

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
    enum: ['createdAt', 'id'],
  })
  @IsIn(['createdAt', 'id'])
  @IsOptional()
  sortBy?: 'createdAt' | 'id' = 'createdAt'

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
  invoiceId?: number

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number
}
