import { ApiProperty } from '@nestjs/swagger'

import { RefundStatusEnum } from '@domain/entities/refund_request.entity'

export class RequestRefundByClientPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  invoiceId: number

  @ApiProperty()
  refundReason: string

  @ApiProperty({
    required: true,
    enum: RefundStatusEnum,
    description: '1 = NONE, 2 = PENDING, 3 = APPROVED, 4 = REJECTED,',
  })
  refundStatus: RefundStatusEnum

  @ApiProperty({
    required: false,
  })
  rejectReason?: string

  constructor({
    id,
    invoiceId,
    refundReason,
    refundStatus,
    rejectReason,
  }: RequestRefundByClientPresenter) {
    this.id = id
    this.invoiceId = invoiceId
    this.refundReason = refundReason
    this.refundStatus = refundStatus
    this.rejectReason = rejectReason
  }
}
