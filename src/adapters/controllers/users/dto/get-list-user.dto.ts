import { ApiProperty } from '@nestjs/swagger'

import { Transform, Type } from 'class-transformer'
import { IsDate, IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator'

import { RoleEnum, UserStatusEnum } from '@domain/entities/user.entity'
import { ISearchUserParams } from '@domain/repositories/user.repository.interface'

export class GetListUserDto implements ISearchUserParams {
  @ApiProperty({
    required: false,
    enum: UserStatusEnum,
    description: '1 = PENDING, 2 = APPROVED, 3 = REJECTED,',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(UserStatusEnum)
  status?: UserStatusEnum

  @ApiProperty({
    required: false,
    enum: RoleEnum,
    description: '1 = ADMIN, 2 = PROVIDER, 3 = CLIENT,',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(RoleEnum)
  role?: RoleEnum

  @ApiProperty({
    required: false,
    type: Date,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  dateLogin?: Date

  @ApiProperty({
    required: false,
    enum: ['createdAt', 'name', 'id'],
  })
  @IsIn(['createdAt', 'name', 'id'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'id' = 'createdAt'

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
