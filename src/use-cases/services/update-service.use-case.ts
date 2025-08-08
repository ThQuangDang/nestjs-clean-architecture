import { Inject, Injectable } from '@nestjs/common'

import { ProviderEntity } from '@domain/entities/providers.entity'
import { ServiceEntity } from '@domain/entities/services.entity'
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
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { id: number; userId: number },
    servicePayload: Partial<ServiceEntity>,
  ): Promise<boolean> {
    const provider = await this.validateProvider(params.userId)

    await this.checkServiceExist({ id: params.id, providerId: provider.id })

    return await this.serviceRepository.updateService(
      { id: params.id, providerId: provider.id },
      servicePayload,
    )
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

  private async checkServiceExist({
    id,
    providerId,
  }: {
    id: number
    providerId: number
  }): Promise<void> {
    const service = await this.serviceRepository.findOnService({
      id: id,
      providerId: providerId,
    })
    if (!service) {
      this.exceptionsService.notFoundException({
        type: 'NotFound',
        message: 'Service not found',
      })
    }
  }
}
