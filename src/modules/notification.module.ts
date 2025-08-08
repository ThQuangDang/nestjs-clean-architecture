import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { NOTIFICATION_REPOSITORY } from '@domain/repositories/notification.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'

import { CreateNotificationUseCase } from '@use-cases/notifications/create-notification.use-case'
import { GetListNotificationUseCase } from '@use-cases/notifications/get-list-notification.use-case'

import { NotificationController } from '@adapters/controllers/notifications/notifications.controller'
import { NotificationGateway } from '@adapters/gateways/notification/notification.gateway'

import { Notification } from '@infrastructure/databases/postgressql/entities/notifications.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { NotificationRepository } from '@infrastructure/databases/postgressql/repositories/notification.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification])],
  controllers: [NotificationController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    CreateNotificationUseCase,
    GetListNotificationUseCase,
    NotificationGateway,
  ],
})
export class NotificationModule {}
