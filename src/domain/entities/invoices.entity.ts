export enum InvoiceStatusEnum {
  PENDING = 1,
  PAID = 2,
  CANCELED = 3,
  REFUNDED = 4,
}

export class InvoiceEntity {
  public readonly id!: number
  public appointmentId!: number
  public providerId!: number
  public clientId!: number
  public totalAmount!: number
  public status!: InvoiceStatusEnum
  public issuedDate!: Date
  public dueDate?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
