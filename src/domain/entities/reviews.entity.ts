export enum ReviewStatusEnum {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export class ReviewEntity {
  public readonly id!: number
  public clientId!: number
  public providerId!: number
  public serviceId!: number
  public appointmentId!: number
  public rating!: number
  public comment?: string
  public status!: ReviewStatusEnum
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
