import { Inject, Injectable } from '@nestjs/common'

import {
  ServiceEntity,
  ServiceStatusEnum,
} from '@domain/entities/services.entity'
import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

@Injectable()
export class GetDetailServiceUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: { id: number; userId: number }) {
    const user = await this.checkUser(params.userId)

    return await this.getDetailService({
      id: params.id,
      user,
    })
  }

  private async getDetailService({ id, user }: { id: number; user: User }) {
    const service = await this.serviceRepository.getServiceById(id)

    if (!service) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Service not found',
      })
    }

    if (user.role === RoleEnum.ADMIN) {
      return service
    }

    if (user.role === RoleEnum.PROVIDER) {
      await this.checkProvider(user.id, service)

      return service
    }

    if (service.status !== ServiceStatusEnum.ACTIVE) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view active services.',
      })
    }

    return {
      id: service.id,
      name: service.name,
      price: service.price,
      description: service.description,
      status: service.status,
      rating: service.rating,
      providerId: service.providerId,
    }
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

  private async checkProvider(userId: number, service: ServiceEntity) {
    const provider = await this.providerRepository.findProviderByUserId(userId)

    const isOwner = provider && service.providerId === provider.id

    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view your own services.',
      })
    }
  }
}
