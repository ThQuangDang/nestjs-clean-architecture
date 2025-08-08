export enum RefundStatusEnum {
  NONE = 1,
  PENDING = 2,
  APPROVED = 3,
  REJECTED = 4,
}

export class RefundRequestEntity {
  public readonly id!: number
  public invoiceId!: number
  public clientId!: number
  public userId?: number
  public refundReason!: string
  public refundStatus!: RefundStatusEnum
  public rejectReason?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
