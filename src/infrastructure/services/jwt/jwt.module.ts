import { Module } from '@nestjs/common'
import {
  JwtModule as JwtBaseModule,
  JwtService as JwtBaseService,
} from '@nestjs/jwt'

import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'

import { JwtService } from './jwt.service'

@Module({
  imports: [JwtBaseModule.register({}), EnvironmentConfigModule],
  providers: [JwtBaseService, JwtService],
  exports: [JwtBaseService, JwtService],
})
export class JwtModule {}
