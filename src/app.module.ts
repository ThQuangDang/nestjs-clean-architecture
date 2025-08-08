import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppointmentModule } from '@modules/appointment.module'
import { ChatModule } from '@modules/chat.module'
import { InvoiceModule } from '@modules/invoice.module'
import { NotificationModule } from '@modules/notification.module'
import { PaymentModule } from '@modules/payment.module'
import { PromotionModule } from '@modules/promotion.module'
import { RequestRefundModule } from '@modules/refund.module'
import { RevenueModule } from '@modules/revenue.module'
import { ReviewModule } from '@modules/review.module'
import { ServicesModule } from '@modules/service.module'
import { UserModule } from '@modules/user.module'

import { MaintenanceMiddleware } from './infrastructure/common/middlewares/maintenance.middleware'
import { JwtRefreshStrategy } from './infrastructure/common/strategies/jwt-refresh.strategy'
import { JwtStrategy } from './infrastructure/common/strategies/jwt.strategy'
import { EnvironmentConfigModule } from './infrastructure/config/environment/environment-config.module'
import { User } from './infrastructure/databases/postgressql/entities/user.entity'
import { UserRepository } from './infrastructure/databases/postgressql/repositories/user.repository'
import { TypeOrmConfigModule } from './infrastructure/databases/postgressql/typeorm.module'
import { ExceptionsModule } from './infrastructure/exceptions/exceptions.module'
import { LoggerModule } from './infrastructure/logger/logger.module'
import { AuthModule } from './modules/auth.module'
import { HealthModule } from './modules/health.module'
import { TasksModule } from './modules/task.module'

@Module({
  imports: [
    EnvironmentConfigModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    LoggerModule,
    ExceptionsModule,
    TypeOrmConfigModule,
    TypeOrmModule.forFeature([User]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    HealthModule,
    AuthModule,
    TasksModule,
    UserModule,
    ServicesModule,
    PromotionModule,
    AppointmentModule,
    InvoiceModule,
    PaymentModule,
    RevenueModule,
    ReviewModule,
    NotificationModule,
    RequestRefundModule,
    ChatModule,
  ],
  providers: [UserRepository, JwtStrategy, JwtRefreshStrategy],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintenanceMiddleware)
      .exclude({
        version: ['1'],
        path: 'health',
        method: RequestMethod.GET,
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
