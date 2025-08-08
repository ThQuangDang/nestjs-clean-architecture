import { Module } from '@nestjs/common'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { LoggerService } from '@infrastructure/logger/logger.service'

import { StripeService } from './stripe.service'

@Module({
  imports: [EnvironmentConfigModule],
  providers: [StripeService, LoggerService],
  exports: [StripeService],
})
export class StripeModule {}
