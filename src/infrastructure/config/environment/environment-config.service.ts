import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { IDatabaseConfig } from '@domain/config/database.interface'
import { IJwtConfig } from '@domain/config/jwt.interface'

@Injectable()
export class EnvironmentConfigService implements IDatabaseConfig, IJwtConfig {
  constructor(private readonly configService: ConfigService) {}

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || ''
  }

  getDatabaseEngine(): string {
    return this.configService.get<string>('DATABASE_ENGINE') || ''
  }

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST') || ''
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT') || 0
  }

  getDatabaseUser(): string {
    return this.configService.get<string>('DATABASE_USER') || ''
  }

  getDatabasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD') || ''
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME') || ''
  }

  getDatabaseSchema(): string {
    return this.configService.get<string>('DATABASE_SCHEMA') || 'public'
  }

  getDatabaseSync(): boolean {
    return this.configService.get<boolean>('DATABASE_SYNCHRONIZE') || false
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || ''
  }

  getJwtExpirationTime(): string {
    return this.configService.get<string>('JWT_EXPIRATION_TIME') || ''
  }

  getJwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') || ''
  }

  getJwtRefreshExpirationTime(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || ''
  }

  getSmtpSystemGmail(): string {
    return this.configService.get<string>('SMTP_SYSTEM_GMAIL') || ''
  }

  getSmtpSystemPass(): string {
    return this.configService.get<string>('SMTP_SYSTEM_PASS') || ''
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT') || 0
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || ''
  }

  getStripePublishableKey(): string {
    return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || ''
  }

  getStripeSecretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY') || ''
  }

  getStripeWebhookSecret(): string {
    return this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || ''
  }
}
