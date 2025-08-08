import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  INotificationRepository,
  ISearchNofificationParam,
  NOTIFICATION_REPOSITORY,
} from '@domain/repositories/notification.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListNotificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchNofificationParam & { id: number }) {
    const user = await this.checkUser(queryParams.id)

    if (user.role !== RoleEnum.ADMIN) {
      queryParams.userId = user.id
    }

    return await this.notificationRepository.findNotifications(queryParams)
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'User not found',
      })
    }

    return user
  }
}
