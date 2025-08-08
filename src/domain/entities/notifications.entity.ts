export enum NotificationTypeEnum {
  EMAIL = 1,
  WEB = 2,
  SMS = 3,
}

export class NotificationEntity {
  public readonly id!: number
  public userId!: number
  public type!: NotificationTypeEnum
  public title!: string
  public message!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
