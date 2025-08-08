import { Module } from '@nestjs/common'

import Redis from 'ioredis'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { EnvironmentConfigService } from '@infrastructure/config/environment/environment-config.service'

import { RedisService } from './redis.service'

@Module({
  imports: [EnvironmentConfigModule],
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
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
