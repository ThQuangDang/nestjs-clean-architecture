import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import { IsDate, IsIn, IsInt, IsOptional, Min } from 'class-validator'

import { ISearchRevenueParam } from '@domain/repositories/revenue.repository.interface'

export class GetListRevenueDto implements ISearchRevenueParam {
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
