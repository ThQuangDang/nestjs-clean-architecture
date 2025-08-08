import { ApiProperty } from '@nestjs/swagger'

import { CreateInvoicePresenter } from './create-invoice.presenter'

export class GetListInvoicePresenter extends CreateInvoicePresenter {
  @ApiProperty()
  appointmentId: number

  @ApiProperty()
  providerId: number

  @ApiProperty()
  clientId: number

  constructor({
    id,
    totalAmount,
    status,
    issuedDate,
    dueDate,
    appointmentId,
    providerId,
    clientId,
  }: GetListInvoicePresenter) {
    super({ id, totalAmount, status, issuedDate, dueDate })
    this.appointmentId = appointmentId
    this.providerId = providerId
    this.clientId = clientId
  }
}
