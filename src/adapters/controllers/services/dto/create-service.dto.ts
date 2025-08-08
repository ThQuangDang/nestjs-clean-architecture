import { ApiProperty } from '@nestjs/swagger'

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateServiceDto {
  @ApiProperty({ required: true, maxLength: 255, description: 'Name service' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string

  @ApiProperty({
    required: false,
    maxLength: 20000,
    description: 'Service description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string

  @ApiProperty({
    required: true,
    description: 'Service price',
  })
  @IsNotEmpty()
  @IsNumber()
  price!: number
}
