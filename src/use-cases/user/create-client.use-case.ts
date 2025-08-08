import { Inject, Injectable } from '@nestjs/common'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { userId: number },
    payload: { fullName: string; description?: string },
  ) {
    const user = await this.checkUser(params.userId)

    return await this.clientRepository.createClient({
      fullName: payload.fullName,
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
