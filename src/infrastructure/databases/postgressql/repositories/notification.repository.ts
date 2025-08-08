import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { endOfDay, startOfDay } from 'date-fns'
import { Repository } from 'typeorm'

import { NotificationEntity } from '@domain/entities/notifications.entity'
import {
  INotificationRepository,
  ISearchNofificationParam,
} from '@domain/repositories/notification.repository.interface'

import { Notification } from '../entities/notifications.entity'

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(data: Partial<NotificationEntity>) {
    const notification = this.notificationRepository.create(data)
    return await this.notificationRepository.save(notification)
  }

  async findNotifications(params: ISearchNofificationParam) {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.type',
        'notification.userId',
        'notification.title',
        'notification.message',
        'notification.createdAt',
      ])

    if (params.userId) {
      query.andWhere('notification.userId = :userId', {
        userId: params.userId,
      })
    }

    if (params.inDate) {
      const startDate = startOfDay(params.inDate)
      const endDate = endOfDay(params.inDate)
      query.andWhere('notification.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
    }

    if (params.type) {
      query.andWhere('notification.type = :type', {
        type: params.type,
      })
    }

    if (params.search?.trim()) {
      query.andWhere(
        '(notification.title ILIKE :search OR notification.message ILIKE :search)',
        {
          search: `%${params.search}%`,
        },
      )
    }

    query.orderBy(`notification.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }
}
