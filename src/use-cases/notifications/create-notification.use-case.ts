import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { NotificationTypeEnum } from '@domain/entities/notifications.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '@domain/repositories/notification.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

import { NotificationGateway } from '@adapters/gateways/notification/notification.gateway'

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @OnEvent('notification.sent')
  async execute(payload: {
    subject: string
    text: string
    userId: number
    type: NotificationTypeEnum
  }) {
    const user = await this.checkUser(payload.userId)
    const notification = await this.notificationRepository.createNotification({
      type: payload.type,
      title: payload.subject,
      message: payload.text,
      userId: user.id,
    })

    this.notificationGateway.sendNotificationToUser(user.id, notification)
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    return user
  }
}
