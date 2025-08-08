import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { APPOINTMENT_REPOSITORY } from '@domain/repositories/appointment.repository.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { INVOICE_REPOSITORY } from '@domain/repositories/invoice.repository.interface'
import { PAYMENT_REPOSITORY } from '@domain/repositories/payment.repository.interface'
import { PROMOTION_USAGE_REPOSITORY } from '@domain/repositories/promotion-usage.repository.interface'
import { PROMOTION_REPOSITORY } from '@domain/repositories/promotion.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { CreateInvoiceUseCase } from '@use-cases/invoices/create-invoice.use-case'
import { GetDetailInvoiceUseCase } from '@use-cases/invoices/get-detail-invoice.use-case'
import { GetListInvoiceUseCase } from '@use-cases/invoices/get-list-invoice.use-case'
import { HandleInvoiceExpriedUseCase } from '@use-cases/invoices/handle-invoice-expried.use-case'

import { InvoiceController } from '@adapters/controllers/invoices/invoices.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Invoice } from '@infrastructure/databases/postgressql/entities/invoices.entity'
import { Payment } from '@infrastructure/databases/postgressql/entities/payments.entity'
import { Promotion } from '@infrastructure/databases/postgressql/entities/promotions.entity'
import { PromotionUsage } from '@infrastructure/databases/postgressql/entities/promotions_usage.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { AppointmentRepository } from '@infrastructure/databases/postgressql/repositories/appointment.repository'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { InvoiceRepository } from '@infrastructure/databases/postgressql/repositories/invoice.repository'
import { PaymentRepository } from '@infrastructure/databases/postgressql/repositories/payment.repository'
import { PromotionUsageRepository } from '@infrastructure/databases/postgressql/repositories/promotion-usage.repository'
import { PromotionRepository } from '@infrastructure/databases/postgressql/repositories/promotion.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { GmailModule } from '@infrastructure/services/gmail/gmail.module'
import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Client,
      Promotion,
      Invoice,
      PromotionUsage,
      User,
      Provider,
      Payment,
    ]),
    GmailModule,
    EnvironmentConfigModule,
  ],
  controllers: [InvoiceController],
  providers: [
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
    {
      provide: PROMOTION_REPOSITORY,
      useClass: PromotionRepository,
    },
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
    {
      provide: PROMOTION_USAGE_REPOSITORY,
      useClass: PromotionUsageRepository,
    },
    {
      provide: GMAIL_SERVICE,
      useClass: GmailSevice,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    CreateInvoiceUseCase,
    GetListInvoiceUseCase,
    GetDetailInvoiceUseCase,
    HandleInvoiceExpriedUseCase,
    CaslAbilityFactory,
  ],
})
export class InvoiceModule {}
