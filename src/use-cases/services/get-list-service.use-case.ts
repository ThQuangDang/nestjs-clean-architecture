import { Inject, Injectable } from '@nestjs/common'

import { ServiceStatusEnum } from '@domain/entities/services.entity'
import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  ISearchServiceParam,
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListServiceUseCase {
  constructor(
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchServiceParam & { userId: number }) {
    const user = await this.checkUser(queryParams.userId)

    let providerId: number | undefined = queryParams.providerId
    let status: ServiceStatusEnum | undefined = queryParams.status

    if (user.role === RoleEnum.ADMIN) {
      providerId = queryParams.providerId
      status = queryParams.status
    } else if (user.role === RoleEnum.CLIENT) {
      status = ServiceStatusEnum.ACTIVE
    } else if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.checkProvider(queryParams.userId)

      providerId = provider.id
    }

    const services = await this.serviceRepository.findServices({
      ...queryParams,
      providerId,
      status,
    })

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      description: s.description,
      status: s.status,
      rating: s.rating,
      providerId: s.providerId,
    }))
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
}
