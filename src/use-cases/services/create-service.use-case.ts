import { Inject, Injectable } from '@nestjs/common'

import { ProviderEntity } from '@domain/entities/providers.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '@domain/repositories/service.repository.interface'

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: { userId: number; name: string; price: number }) {
    await this.validateUniqueName(payload.name)

    const provider = await this.validateProvider(payload.userId)

    const service = await this.serviceRepository.createService({
      name: payload.name,
      price: payload.price,
      providerId: provider.id,
    })

    return service
  }

  private async validateUniqueName(name: string): Promise<void> {
    const nameService = await this.serviceRepository.getServiceByName(name)

    if (nameService) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'Name service already exist',
      })
    }
  }

  private async validateProvider(id: number): Promise<ProviderEntity> {
    const provider = await this.providerRepository.findProviderByUserId(id)

    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'NotFound',
        message: 'Provider not found',
      })
    }

    return provider
  }
}
