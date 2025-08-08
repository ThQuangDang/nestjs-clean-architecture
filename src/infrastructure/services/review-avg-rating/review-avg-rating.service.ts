import { InjectQueue } from '@nestjs/bull'
import { Inject, Injectable } from '@nestjs/common'

import { Queue } from 'bull'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'
import { IRedisService, REDIS_SERVICE } from '@domain/services/redis.interface'

@Injectable()
export class ReviewAvgRatingService {
  constructor(
    @Inject(REDIS_SERVICE)
    private readonly redisService: IRedisService,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @InjectQueue('reviewAvgRatingQueue')
    private readonly reviewAvgRatingQueue: Queue,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async addreviewAvgRatingQueue(
    serviceId: number,
    rating: number,
    providerId: number,
    action: 'create' | 'reject',
  ): Promise<void> {
    await this.reviewAvgRatingQueue.add(
      {
        serviceId,
        rating,
        providerId,
        action,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    )
  }

  async execute(
    serviceId: number,
    rating: number,
    providerId: number,
    action: 'create' | 'reject',
  ) {
    if (action === 'reject') {
      await this.redisService.removeRatingData(serviceId, rating)
    } else {
      await this.redisService.updateRatingData(serviceId, rating)
    }

    const { avgRating } = await this.redisService.getRatingData(serviceId)

    const service = await this.serviceRepository.findOnService({
      id: serviceId,
      providerId,
    })

    if (!service) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Service not found',
      })
    }

    await this.serviceRepository.updateService(
      {
        id: serviceId,
        providerId,
      },
      {
        rating: avgRating,
      },
    )
  }
}
