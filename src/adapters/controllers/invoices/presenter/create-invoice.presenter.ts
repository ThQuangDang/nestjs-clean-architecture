import { ApiProperty } from '@nestjs/swagger'

import { InvoiceStatusEnum } from '@domain/entities/invoices.entity'

export class CreateInvoicePresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  totalAmount: number

  @ApiProperty({ enum: InvoiceStatusEnum })
  status: InvoiceStatusEnum

  @ApiProperty()
  issuedDate: Date

  @ApiProperty({ required: false })
  dueDate?: Date

  constructor({
    id,
    totalAmount,
    status,
    issuedDate,
    dueDate,
  }: CreateInvoicePresenter) {
    this.id = id
    this.totalAmount = totalAmount
    this.status = status
    this.issuedDate = issuedDate
    this.dueDate = dueDate
  }
}
