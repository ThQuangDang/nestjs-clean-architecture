import { Inject, Injectable } from '@nestjs/common'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class CreateProviderUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { userId: number },
    payload: { businessName: string; description?: string },
  ) {
    const user = await this.checkUser(params.userId)

    return await this.providerRepository.createProvider({
      businessName: payload.businessName,
      description: payload.description,
      userId: user.id,
    })
  }

  private async checkUser(id: number) {
    const user = await this.userRepository.getUserById(id)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    return user
  }
}
