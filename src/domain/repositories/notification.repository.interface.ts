import {
  NotificationEntity,
  NotificationTypeEnum,
} from '@domain/entities/notifications.entity'

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY_INTERFACE'

export interface ISearchNofificationParam {
  type?: NotificationTypeEnum
  inDate?: Date
  search?: string
  userId?: number
  sortBy?: 'createdAt' | 'id'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}

export interface INotificationRepository {
  createNotification(
    data: Partial<NotificationEntity>,
  ): Promise<NotificationEntity>
  findNotifications(
    params: ISearchNofificationParam,
  ): Promise<NotificationEntity[]>
}
