import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator'

import { ServiceStatusEnum } from '@domain/entities/services.entity'
import { ISearchServiceParam } from '@domain/repositories/service.repository.interface'

export class GetListServiceDto implements ISearchServiceParam {
  @ApiProperty({
    required: false,
    enum: ServiceStatusEnum,
    description: '1: ACTIVE, 2: INACTIVE',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(ServiceStatusEnum)
  @IsOptional()
  status?: ServiceStatusEnum

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
    enum: ['createdAt', 'name', 'price'],
  })
  @IsIn(['createdAt', 'name', 'price'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'price' = 'createdAt'

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
