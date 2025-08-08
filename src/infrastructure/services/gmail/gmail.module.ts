import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { EnvironmentConfigService } from '@infrastructure/config/environment/environment-config.service'

import { EmailProcessor } from './gmail.processor'
import { GmailSevice } from './gmail.service'

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'emailQueue',
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
  ],
  providers: [GmailSevice, EmailProcessor],
  exports: [GmailSevice, BullModule],
})
export class GmailModule {}
