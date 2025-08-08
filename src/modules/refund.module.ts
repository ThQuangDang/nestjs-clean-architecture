import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { APPOINTMENT_REPOSITORY } from '@domain/repositories/appointment.repository.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { INVOICE_REPOSITORY } from '@domain/repositories/invoice.repository.interface'
import { NOTIFICATION_REPOSITORY } from '@domain/repositories/notification.repository.interface'
import { REFUND_REQUEST_REPOSITORY } from '@domain/repositories/refund-request.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { GetListRequestRefundUseCase } from '@use-cases/refund-requests/get-list-request-refund.use-case'
import { RequestRefundByAdminUseCase } from '@use-cases/refund-requests/request-refund-by-admin.use-case'
import { RequestRefundByClientUseCase } from '@use-cases/refund-requests/request-refund-by-client.use-case'

import { IsApprovedOrRejected } from '@adapters/controllers/refund-requests/dto/request-refund-by-admin.dto'
import { RefundRequestController } from '@adapters/controllers/refund-requests/refund-requests.controller'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Invoice } from '@infrastructure/databases/postgressql/entities/invoices.entity'
import { Notification } from '@infrastructure/databases/postgressql/entities/notifications.entity'
import { RefundRequest } from '@infrastructure/databases/postgressql/entities/refund_request.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { AppointmentRepository } from '@infrastructure/databases/postgressql/repositories/appointment.repository'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { InvoiceRepository } from '@infrastructure/databases/postgressql/repositories/invoice.repository'
import { NotificationRepository } from '@infrastructure/databases/postgressql/repositories/notification.repository'
import { RefundRequestRepository } from '@infrastructure/databases/postgressql/repositories/refund-request.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { GmailModule } from '@infrastructure/services/gmail/gmail.module'
import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Invoice,
      Client,
      Notification,
      Appointment,
      RefundRequest,
    ]),
    GmailModule,
    EnvironmentConfigModule,
  ],
  controllers: [RefundRequestController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
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
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepository,
    },
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: REFUND_REQUEST_REPOSITORY,
      useClass: RefundRequestRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    {
      provide: GMAIL_SERVICE,
      useClass: GmailSevice,
    },
    RequestRefundByClientUseCase,
    RequestRefundByAdminUseCase,
    GetListRequestRefundUseCase,
    IsApprovedOrRejected,
    CaslAbilityFactory,
  ],
})
export class RequestRefundModule {}
