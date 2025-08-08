export enum ServiceStatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
}

export class ServiceEntity {
  public readonly id!: number
  public providerId!: number
  public name!: string
  public rating!: number
  public description?: string
  public price!: number
  public status!: ServiceStatusEnum
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
