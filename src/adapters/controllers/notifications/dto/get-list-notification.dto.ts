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

import { NotificationTypeEnum } from '@domain/entities/notifications.entity'
import { ISearchNofificationParam } from '@domain/repositories/notification.repository.interface'

export class GetListNotificationDto implements ISearchNofificationParam {
  @ApiProperty({
    required: false,
    enum: NotificationTypeEnum,
    description: '1 = EMAIL, 2 = WEB, 3 = SMS',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsOptional()
  @IsEnum(NotificationTypeEnum)
  type?: NotificationTypeEnum

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
  userId?: number
}
