export class ProviderEntity {
  public readonly id!: number
  public userId!: number
  public businessName!: string
  public description?: string
  public rating!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
