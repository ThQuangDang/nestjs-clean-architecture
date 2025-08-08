export enum PaymentStatusEnum {
  PENDING = 1,
  COMPLETED = 2,
  FAILED = 3,
  REFUNDED = 4,
}

export enum PaymentMethodEnum {
  STRIPE = 1,
  PAYPAL = 2,
}

export class PaymentEntity {
  public readonly id!: number
  public appointmentId!: number
  public clientId!: number
  public providerId!: number
  public invoiceId!: number
  public amount!: number
  public status!: PaymentStatusEnum
  public paymentMethod!: PaymentMethodEnum
  public transactionId!: string
  public refundAmount!: number
  public retryCount!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
