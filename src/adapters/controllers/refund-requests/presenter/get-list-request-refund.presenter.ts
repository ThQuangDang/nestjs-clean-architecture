import { ApiProperty } from '@nestjs/swagger'

import { RequestRefundByClientPresenter } from './request-refund-by-client.presenter'

export class GetListRequestRefundPresenter extends RequestRefundByClientPresenter {
  @ApiProperty()
  clientId: number

  constructor({
    id,
    invoiceId,
    refundReason,
    refundStatus,
    rejectReason,
    clientId,
  }: GetListRequestRefundPresenter) {
    super({ id, invoiceId, refundReason, refundStatus, rejectReason })
    this.clientId = clientId
  }
}
