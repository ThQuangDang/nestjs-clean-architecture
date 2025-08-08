export class RevenueEntity {
  public readonly id!: number
  public providerId!: number
  public totalIncome!: number
  public commission!: number
  public netIncome!: number
  public month!: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
