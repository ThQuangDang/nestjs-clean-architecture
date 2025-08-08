import { NotificationTypeEnum } from '@domain/entities/notifications.entity'

export class NotificationPresenter {
  id: number
  type: NotificationTypeEnum
  title: string
  message: string
  constructor({ id, type, title, message }: NotificationPresenter) {
    this.id = id
    this.type = type
    this.title = title
    this.message = message
  }
}
