import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { PAYMENT_REPOSITORY } from '@domain/repositories/payment.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { REVENUE_REPOSITORY } from '@domain/repositories/revenue.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { CreateRevenueUseCase } from '@use-cases/revenues/create-revenue.use-case'
import { GetDetailRevenueUseCase } from '@use-cases/revenues/get-detail-revenue.use-case'
import { GetListRevenueUseCase } from '@use-cases/revenues/get-list-revenue.use-case'

import { RevenueController } from '@adapters/controllers/revenues/revenues.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Payment } from '@infrastructure/databases/postgressql/entities/payments.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { Revenue } from '@infrastructure/databases/postgressql/entities/revenues.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { PaymentRepository } from '@infrastructure/databases/postgressql/repositories/payment.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { RevenueRepository } from '@infrastructure/databases/postgressql/repositories/revenue.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { GmailModule } from '@infrastructure/services/gmail/gmail.module'
import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Revenue, Payment, User]),
    GmailModule,
    EnvironmentConfigModule,
  ],
  controllers: [RevenueController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: REVENUE_REPOSITORY,
      useClass: RevenueRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    {
      provide: GMAIL_SERVICE,
      useClass: GmailSevice,
    },
    CreateRevenueUseCase,
    GetListRevenueUseCase,
    GetDetailRevenueUseCase,
    CaslAbilityFactory,
  ],
})
export class RevenueModule {}
