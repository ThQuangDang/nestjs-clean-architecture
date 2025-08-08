import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateClientDto {
  @ApiProperty({
    required: true,
    maxLength: 255,
    description: 'Full name client',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName!: string

  @ApiProperty({
    required: false,
    maxLength: 20000,
    description: 'Desscription client',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string
}
