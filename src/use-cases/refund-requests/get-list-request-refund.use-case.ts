import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IRefundRequestRepository,
  ISearchRefundRequestParams,
  REFUND_REQUEST_REPOSITORY,
} from '@domain/repositories/refund-request.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListRequestRefundUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFUND_REQUEST_REPOSITORY)
    private readonly refundRequestRepository: IRefundRequestRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchRefundRequestParams & { userId: number }) {
    const user = await this.checkUser(queryParams.userId)

    if (user.role !== RoleEnum.ADMIN) {
      const client = await this.checkClient(user.id)
      queryParams.clientId = client.id
    }

    return await this.refundRequestRepository.findRefundRequest(queryParams)
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
