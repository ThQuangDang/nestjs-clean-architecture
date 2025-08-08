import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator'

import { ReviewStatusEnum } from '@domain/entities/reviews.entity'
import { ISearchReviewParam } from '@domain/repositories/review.repository.interface'

export class GetListReviewDto implements ISearchReviewParam {
  @ApiProperty({
    required: false,
    enum: ReviewStatusEnum,
    description: '1: PENDING, 2: APPROVED, 3: REJECTED',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(ReviewStatusEnum)
  @IsOptional()
  status?: ReviewStatusEnum

  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number

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
    enum: ['createdAt', 'rating'],
  })
  @IsIn(['createdAt', 'rating'])
  @IsOptional()
  sortBy?: 'createdAt' | 'rating' = 'createdAt'

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

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  appointmentId?: number
}
