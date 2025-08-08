import { Inject, Injectable } from '@nestjs/common'

import {
  AppointmentEntity,
  AppointmentStatusEnum,
} from '@domain/entities/appointments.entity'
import { RoleEnum, UserEntity } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
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
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<
    RoleEnum,
    Partial<Record<AppointmentStatusEnum, AppointmentStatusEnum[]>>
  >
> = {
  [RoleEnum.CLIENT]: {
    [AppointmentStatusEnum.PENDING]: [AppointmentStatusEnum.CANCELED],
    [AppointmentStatusEnum.CONFIRMED]: [AppointmentStatusEnum.CANCELED],
  },
  [RoleEnum.PROVIDER]: {
    [AppointmentStatusEnum.PENDING]: [
      AppointmentStatusEnum.CONFIRMED,
      AppointmentStatusEnum.CANCELED,
    ],
    [AppointmentStatusEnum.CONFIRMED]: [
      AppointmentStatusEnum.CANCELED,
      AppointmentStatusEnum.COMPLETED,
    ],
  },
}
@Injectable()
export class UpdateStatusAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { userId: number; appointmentId: number },
    payload: { status: AppointmentStatusEnum; cancelReason?: string },
  ) {
    const user = await this.checkUser(params.userId)

    const appointment = await this.checkAppointment(
      user.role,
      params.appointmentId,
      user.id,
    )

    this.checkAllowedStatusTransition(
      appointment.status,
      payload.status,
      user.role,
    )

    const client = await this.checkClient(appointment.clientid)
    const provider = await this.checkProvider(appointment.providerid)

    if (client == null || provider == null) {
      throw this.exceptionsService.internalServerErrorException({
        type: 'Internal Server Error',
        message:
          'Could not retrieve complete details for sending notification.',
      })
    }

    const updatePayload: Partial<AppointmentEntity> = {
      status: payload.status,
    }

    if (payload.status === AppointmentStatusEnum.CANCELED) {
      updatePayload.cancelReason = payload.cancelReason
      updatePayload.userIdReject = user.id
    }

    const upAppointment = await this.appointmentRepository.updateAppointment(
      {
        id: [appointment.id],
      },
      updatePayload,
    )

    await this.sendMail(
      user,
      payload.status,
      appointment.servicename,
      appointment.appointmenttime,
      client,
      provider,
      payload.cancelReason,
    )

    return upAppointment
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (user == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    return user
  }

  private async checkProvider(id: number) {
    const provider = await this.providerRepository.getProviderById(id)

    return provider
  }

  private async checkAppointment(
    userRole: RoleEnum,
    appointmentId: number,
    userId: number,
  ) {
    const appointment =
      await this.appointmentRepository.getAppointmentById(appointmentId)

    if (appointment == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }

    const isClientOfAppointment =
      userRole === RoleEnum.CLIENT && appointment.clientuserid === userId
    const isProviderOfAppointment =
      userRole === RoleEnum.PROVIDER && appointment.provideruserid === userId
    if (!isClientOfAppointment && !isProviderOfAppointment) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: `User is not authorized to modify appointment`,
      })
    }

    return appointment
  }

  private async checkClient(id: number) {
    const client = await this.clientRepository.getClientById(id)

    return client
  }

  private checkAllowedStatusTransition(
    currentStatus: AppointmentStatusEnum,
    targetStatus: AppointmentStatusEnum,
    userRole: RoleEnum,
  ): void {
    if (currentStatus === targetStatus) {
      throw this.exceptionsService.badRequestException({
        type: 'AppointmentAlreadyExists',
        message: `This appointment has been checked by you with currentStatus: ${currentStatus}`,
      })
    }

    const allowedTargetStatuses =
      ALLOWED_STATUS_TRANSITIONS[userRole]?.[currentStatus]

    if (
      !allowedTargetStatuses ||
      !allowedTargetStatuses.includes(targetStatus)
    ) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: `Invalid status transition from ${currentStatus} to ${targetStatus} for role ${userRole}.`,
      })
    }
  }

  private async sendMail(
    actorUser: UserEntity,
    newStatus: AppointmentStatusEnum,
    serviceName: string,
    appointmentTime: Date,
    client: IProfileUserPayload,
    provider: IProfileUserPayload,
    cancelReason?: string,
  ) {
    if (newStatus === AppointmentStatusEnum.CANCELED) {
      let userId: number
      const cancelBy =
        actorUser.role === RoleEnum.CLIENT ? 'Client' : 'Provider'
      if (actorUser.role === RoleEnum.CLIENT) {
        userId = client.userid
      } else {
        userId = provider.userid
      }
      await this.gmailService.sendMailProviderOrClientCancel({
        userId,
        providerEmail: provider.email,
        providerName: provider.username,
        clientEmail: client.email,
        clientName: client.username,
        serviceName: serviceName,
        appointmentTime: appointmentTime,
        cancelReason: cancelReason || '',
        cancelBy: cancelBy,
      })
    }

    if (
      actorUser.role === RoleEnum.PROVIDER &&
      newStatus === AppointmentStatusEnum.CONFIRMED
    ) {
      await this.gmailService.sendMailProviderConfirmToClient({
        userId: provider.userid,
        providerEmail: provider.email,
        providerName: provider.username,
        clientEmail: client.email,
        clientName: client.username,
        serviceName: serviceName,
        appointmentTime: appointmentTime,
      })
    }
  }
}
