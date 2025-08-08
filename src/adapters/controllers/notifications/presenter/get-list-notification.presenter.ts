import { ApiProperty } from '@nestjs/swagger'

import { NotificationTypeEnum } from '@domain/entities/notifications.entity'

export class GetListNotificationPresenter {
  @ApiProperty()
  id: number

  @ApiProperty({
    required: true,
    enum: NotificationTypeEnum,
    description: '1 = EMAIL, 2 = WEB, 3 = SMS',
  })
  type: NotificationTypeEnum

  @ApiProperty()
  title: string

  @ApiProperty()
  message: string

  @ApiProperty()
  userId: number

  constructor({
    id,
    type,
    title,
    message,
    userId,
  }: GetListNotificationPresenter) {
    this.id = id
    this.type = type
    this.title = title
    this.message = message
    this.userId = userId
  }
}
