import { Inject, Injectable } from '@nestjs/common'

import { AppointmentEntity } from '@domain/entities/appointments.entity'
import { RoleEnum } from '@domain/entities/user.entity'
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
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetDetailAppointmentUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: {
    id: number
    userId: number
  }): Promise<AppointmentEntity> {
    const user = await this.checkUser(params.userId)

    const appointment = await this.checkAppointment(params.id)

    if (user.role === RoleEnum.ADMIN) {
      return appointment
    }

    if (user.role === RoleEnum.PROVIDER) {
      await this.checkProvider(user.id, appointment)
      return appointment
    }

    if (user.role === RoleEnum.CLIENT) {
      await this.checkClient(user.id, appointment)
      return appointment
    }

    throw this.exceptionsService.forbiddenException({
      type: 'Forbidden',
      message: 'You are not authorized to view this appointment.',
    })
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)
    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }
    return user
  }

  private async checkProvider(userId: number, appointment: AppointmentEntity) {
    const provider = await this.providerRepository.findProviderByUserId(userId)
    const isOwner = provider && provider.id === appointment.providerId
    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view your own appointments.',
      })
    }
  }

  private async checkAppointment(appointmentId: number) {
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }
    return appointment
  }

  private async checkClient(userId: number, appointment: AppointmentEntity) {
    const client = await this.clientRepository.findClientByUserId(userId)
    const isOwner = client && client.id === appointment.clientId
    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view your own appointments.',
      })
    }
  }
}
