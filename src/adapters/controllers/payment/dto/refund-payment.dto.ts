import { ApiProperty } from '@nestjs/swagger'

import { IsIn, IsOptional, IsString } from 'class-validator'

export class RefundPaymentDto {
  @ApiProperty({
    required: false,
    description: 'Reason for refund.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['duplicate', 'fraudulent', 'requested_by_customer'])
  refundReason?: string
}
