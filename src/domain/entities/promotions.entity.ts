export enum PromotionStatusEnum {
  ACTIVE = 1,
  EXPIRED = 2,
}

export class PromotionEntity {
  public readonly id!: number
  public providerId!: number
  public name!: string
  public discount!: number
  public discountCode!: string
  public maxUsage!: number
  public useCount!: number
  public startDate!: Date
  public endDate!: Date
  public status!: PromotionStatusEnum
  public readonly createdAt!: Date
}
