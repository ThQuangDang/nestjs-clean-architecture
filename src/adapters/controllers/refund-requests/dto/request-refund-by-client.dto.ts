import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class RequestRefundByClientDto {
  @ApiProperty({
    required: true,
    maxLength: 20000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20000)
  refundReason!: string
}
