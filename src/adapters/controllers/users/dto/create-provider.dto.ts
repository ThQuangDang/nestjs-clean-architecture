import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateProviderDto {
  @ApiProperty({
    required: true,
    maxLength: 255,
    description: 'Name business',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  businessName!: string

  @ApiProperty({
    required: false,
    maxLength: 20000,
    description: 'Desscription business',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string
}
