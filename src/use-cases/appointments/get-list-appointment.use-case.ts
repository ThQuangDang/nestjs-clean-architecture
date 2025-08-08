import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
  ISearchAppointmentParam,
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
export class GetListAppointmentUseCase {
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

  async execute(queryParams: ISearchAppointmentParam & { userId: number }) {
    const user = await this.checkUser(queryParams.userId)

    const filter: ISearchAppointmentParam = {
      ...queryParams,
    }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.checkProvider(user.id)

      filter.providerId = provider.id
    } else if (user.role === RoleEnum.CLIENT) {
      const client = await this.checkClient(user.id)

      filter.clientId = client.id
    }

    const appointments =
      await this.appointmentRepository.findAppointments(filter)

    return appointments
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

  private async checkProvider(userId: number) {
    const provider = await this.providerRepository.findProviderByUserId(userId)
    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Provider not found',
      })
    }
    return provider
  }

  private async checkClient(userId: number) {
    const client = await this.clientRepository.findClientByUserId(userId)
    if (!client) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }
    return client
  }
}
