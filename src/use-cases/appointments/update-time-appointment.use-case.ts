import { Inject, Injectable } from '@nestjs/common'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
  IAppointmentService,
} from '@domain/repositories/appointment.repository.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
  IProfileUserPayload,
} from '@domain/repositories/client.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import { GMAIL_SERVICE } from '@domain/services/gmail.interface'

import { GmailSevice } from '@infrastructure/services/gmail/gmail.service'

@Injectable()
export class UpdateTimeAppointmentUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: GmailSevice,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async exceute(
    params: { appointmentId: number; userId: number },
    payload: { appointmentTime: Date },
  ) {
    const client = await this.checkClient(params.userId)
    const appointment = await this.checkAppointment(
      params.appointmentId,
      client.id,
      payload.appointmentTime,
    )
    const provider = await this.checkProvider(appointment.providerid)

    await this.sendMail(provider, appointment, client, payload.appointmentTime)

    return await this.appointmentRepository.updateAppointment(
      {
        id: [appointment.id],
      },
      {
        status: AppointmentStatusEnum.PENDING,
        appointmentTime: payload.appointmentTime,
      },
    )
  }

  private async checkClient(userId: number) {
    const client = await this.clientRepository.findClientByUserId(userId)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkAppointment(
    appointmentId: number,
    clientId: number,
    appointmentTime: Date,
  ) {
    const appointment =
      await this.appointmentRepository.getAppointmentById(appointmentId)

    if (appointment == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }

    if (appointment.clientid !== clientId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: `User is not authorized to modify appointment`,
      })
    }

    if (
      ![
        AppointmentStatusEnum.PENDING,
        AppointmentStatusEnum.CONFIRMED,
      ].includes(appointment.status)
    ) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Status',
        message:
          'Cannot change appointment time unless status is PENDING or CONFIRMED',
      })
    }
    const appointmentTimeCheck =
      await this.appointmentRepository.findAppointmentByTime(
        clientId,
        appointmentTime,
        appointmentId,
      )

    if (appointmentTimeCheck) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'This time slot is already taken by another appointment',
      })
    }
    return appointment
  }

  private async checkProvider(providerId: number) {
    const provider = await this.providerRepository.getProviderById(providerId)

    if (provider == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Provider not found',
      })
    }

    return provider
  }

  private async sendMail(
    provider: IProfileUserPayload,
    appointment: IAppointmentService,
    client: IProfileUserPayload,
    appointmentTime: Date,
  ) {
    await this.gmailService.sendAppointmentTimeChangeMailToProvider({
      userId: provider.userid,
      providerName: provider.username,
      providerEmail: provider.email,
      clientName: client.username,
      newAppointmentTime: appointmentTime,
      appointmentId: appointment.id,
    })
  }
}
