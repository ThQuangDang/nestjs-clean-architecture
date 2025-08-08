import { Inject, Injectable } from '@nestjs/common'

import { ServiceStatusEnum } from '@domain/entities/services.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '@domain/repositories/appointment.repository.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'
import {
  GMAIL_SERVICE,
  IGmailAppointmentProviderPayload,
  IGmailService,
} from '@domain/services/gmail.interface'

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { userId: number; serviceId: number },
    payload: {
      appointmentTime: Date
    },
  ) {
    const client = await this.checkClient(params.userId)

    const service = await this.checkService(params.serviceId)

    const provider = await this.checkProvider(service.providerId)

    await this.checkAppointment(client.id, payload.appointmentTime)

    const appointment = await this.appointmentRepository.createAppointment({
      appointmentTime: payload.appointmentTime,
      clientId: client.id,
      providerId: service.providerId,
      serviceId: service.id,
    })

    await this.sendMail({
      userId: provider.userid,
      providerEmail: provider.email,
      providerName: provider.username,
      clientEmail: client.email,
      clientName: client.username,
      serviceName: service.name,
      appointmentTime: appointment.appointmentTime,
    })

    return appointment
  }

  private async checkClient(id: number) {
    const client = await this.clientRepository.findClientByUserId(id)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkService(id: number) {
    const service = await this.serviceRepository.getServiceById(id)

    if (!service) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Service not found',
      })
    }

    if (service.status === ServiceStatusEnum.INACTIVE) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view active services.',
      })
    }
    return service
  }

  private async checkProvider(id: number) {
    const provider = await this.providerRepository.getProviderById(id)

    if (provider == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Provider not found',
      })
    }

    return provider
  }

  private async checkAppointment(clientId: number, appointmentTime: Date) {
    const appointment = await this.appointmentRepository.findAppointmentByTime(
      clientId,
      appointmentTime,
    )

    if (appointment) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'This time slot is already taken by another appointment',
      })
    }
  }

  private async sendMail(
    payload: IGmailAppointmentProviderPayload,
  ): Promise<void> {
    await this.gmailService.sendAppointmentNotificationToProvider({
      userId: payload.userId,
      providerEmail: payload.providerEmail,
      providerName: payload.providerName,
      clientEmail: payload.clientEmail,
      clientName: payload.clientName,
      serviceName: payload.serviceName,
      appointmentTime: payload.appointmentTime,
    })
  }
}
