import { Inject, Injectable } from '@nestjs/common'

import { ProviderEntity } from '@domain/entities/providers.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'

@Injectable()
export class UpdateProviderUseCase {
  constructor(
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { id: number; userId: number },
    providerPayload: Partial<ProviderEntity>,
  ): Promise<boolean> {
    await this.checkProviderExistence(params)

    return await this.providerRepository.updateProvider(params, providerPayload)
  }

  private async checkProviderExistence(params: {
    id: number
    userId: number
  }): Promise<void> {
    const provider = await this.providerRepository.findOnProvider(params)

    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Provider not found',
      })
    }
  }
}
