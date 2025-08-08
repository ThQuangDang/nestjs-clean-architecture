export class PromotionUsageEntity {
  public readonly id!: number
  public promotionId!: number
  public clientId!: number
  public appointmentId!: number
  public readonly usedAt!: Date
}
