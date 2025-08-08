import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import Redis from 'ioredis'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { SERVICE_REPOSITORY } from '@domain/repositories/service.repository.interface'
import { REDIS_SERVICE } from '@domain/services/redis.interface'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { EnvironmentConfigService } from '@infrastructure/config/environment/environment-config.service'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { ServiceRepository } from '@infrastructure/databases/postgressql/repositories/service.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

import { RedisModule } from '../redis/redis.module'
import { RedisService } from '../redis/redis.service'
import { ReviewAvgRatingProcessor } from './review-avg-rating.processor'
import { ReviewAvgRatingService } from './review-avg-rating.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    BullModule.registerQueueAsync({
      name: 'reviewAvgRatingQueue',
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (environmentConfigService: EnvironmentConfigService) => ({
        redis: {
          host: environmentConfigService.getRedisHost(),
          port: environmentConfigService.getRedisPort(),
        },
      }),
    }),
    EnvironmentConfigModule,
    RedisModule,
  ],
  providers: [
    {
      provide: Redis,
      useFactory: (environmentConfigService: EnvironmentConfigService) => {
        return new Redis({
          host: environmentConfigService.getRedisHost(),
          port: environmentConfigService.getRedisPort(),
        })
      },
      inject: [EnvironmentConfigService],
    },
    {
      provide: REDIS_SERVICE,
      useClass: RedisService,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    ReviewAvgRatingService,
    ReviewAvgRatingProcessor,
  ],
  exports: [ReviewAvgRatingService, BullModule],
})
export class ReviewAvgRatingModule {}
