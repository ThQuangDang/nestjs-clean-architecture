import { ApiProperty, PartialType } from '@nestjs/swagger'

import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'

import { ServiceStatusEnum } from '@domain/entities/services.entity'

import { CreateServiceDto } from './create-service.dto'

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({
    required: false,
    enum: ServiceStatusEnum,
    description: '1: ACTIVE, 2: INACTIVE',
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsEnum(ServiceStatusEnum)
  @IsOptional()
  status?: ServiceStatusEnum
}
