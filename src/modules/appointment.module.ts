import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { APPOINTMENT_REPOSITORY } from '@domain/repositories/appointment.repository.interface'
import { CLIENT_REPOSITORY } from '@domain/repositories/client.repository.interface'
import { PROVIDER_REPOSITORY } from '@domain/repositories/provider.repository.interface'
import { SERVICE_REPOSITORY } from '@domain/repositories/service.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { CreateAppointmentUseCase } from '@use-cases/appointments/create-appointment.use-case'
import { GetDetailAppointmentUseCase } from '@use-cases/appointments/get-detail-appointment.use-case'
import { GetListAppointmentUseCase } from '@use-cases/appointments/get-list-appointment.use-case'
import { UpdateStatusAppointmentUseCase } from '@use-cases/appointments/update-status-appointment.use-case'
import { UpdateTimeAppointmentUseCase } from '@use-cases/appointments/update-time-appointment.use-case'

import { AppointmentController } from '@adapters/controllers/appointments/appointments.controller'
import { IsStatusAppointment } from '@adapters/controllers/appointments/dto/update-status-appointment.dto'

import { CaslAbilityFactory } from '@infrastructure/common/permisions/casl-ability.factory'
import { EnvironmentConfigModule } from '@infrastructure/config/environment/environment-config.module'
import { Appointment } from '@infrastructure/databases/postgressql/entities/appointments.entity'
import { Client } from '@infrastructure/databases/postgressql/entities/clients.entity'
import { Provider } from '@infrastructure/databases/postgressql/entities/providers.entity'
import { Service } from '@infrastructure/databases/postgressql/entities/services.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { AppointmentRepository } from '@infrastructure/databases/postgressql/repositories/appointment.repository'
import { ClientRepository } from '@infrastructure/databases/postgressql/repositories/client.repository'
import { ProviderRepository } from '@infrastructure/databases/postgressql/repositories/provider.repository'
import { ServiceRepository } from '@infrastructure/databases/postgressql/repositories/service.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'
import { GmailModule } from '@infrastructure/services/gmail/gmail.module'
import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Appointment, Client, Provider, User]),
    GmailModule,
    EnvironmentConfigModule,
  ],
  controllers: [AppointmentController],
  providers: [
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
    {
      provide: PROVIDER_REPOSITORY,
      useClass: ProviderRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    {
      provide: GMAIL_SERVICE,
      useClass: GmailSevice,
    },
    CreateAppointmentUseCase,
    UpdateStatusAppointmentUseCase,
    GetListAppointmentUseCase,
    GetDetailAppointmentUseCase,
    CaslAbilityFactory,
    IsStatusAppointment,
    UpdateTimeAppointmentUseCase,
  ],
})
export class AppointmentModule {}
