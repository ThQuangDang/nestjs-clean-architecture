import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { APPOINTMENT_REPOSITORY } from '@domain/repositories/appointment.repository.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { INVOICE_REPOSITORY } from '@domain/repositories/invoice.repository.interface'
import { PAYMENT_REPOSITORY } from '@domain/repositories/payment.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { REFUND_REQUEST_REPOSITORY } from '@domain/repositories/refund-request.repository.interface'
import { STRIPE_SERVICE } from '@domain/services/stripe.interface'

import { InitiatePaymentUseCase } from '@use-cases/payment/create-payment.use-case'
import { HandleStripeWebhookUseCase } from '@use-cases/payment/handle-webhook-stripe.use-case'
import { RefundPaymentUseCase } from '@use-cases/payment/refund-payment.use-case'

import { PaymentController } from '@adapters/controllers/payment/payment.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Invoice } from '@infrastructure/databases/postgressql/entities/invoices.entity'
import { Payment } from '@infrastructure/databases/postgressql/entities/payments.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { RefundRequest } from '@infrastructure/databases/postgressql/entities/refund_request.entity'
import { AppointmentRepository } from '@infrastructure/databases/postgressql/repositories/appointment.repository'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { InvoiceRepository } from '@infrastructure/databases/postgressql/repositories/invoice.repository'
import { PaymentRepository } from '@infrastructure/databases/postgressql/repositories/payment.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { RefundRequestRepository } from '@infrastructure/databases/postgressql/repositories/refund-request.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { LoggerModule } from '@infrastructure/logger/logger.module'
import { StripeService } from '@infrastructure/services/stripe/stripe.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Client,
      Payment,
      Appointment,
      Provider,
      RefundRequest,
    ]),
    EnvironmentConfigModule,
    LoggerModule,
  ],
  controllers: [PaymentController],
  providers: [
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: REFUND_REQUEST_REPOSITORY,
      useClass: RefundRequestRepository,
    },
    {
      provide: STRIPE_SERVICE,
      useClass: StripeService,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    InitiatePaymentUseCase,
    CaslAbilityFactory,
    HandleStripeWebhookUseCase,
    RefundPaymentUseCase,
  ],
})
export class PaymentModule {}
