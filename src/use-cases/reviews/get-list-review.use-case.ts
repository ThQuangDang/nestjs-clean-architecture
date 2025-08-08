import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IReviewRepository,
  ISearchReviewParam,
  REVIEW_REPOSITORY,
} from '@domain/repositories/review.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchReviewParam & { userId: number }) {
    const user = await this.checkUser(queryParams.userId)

    const filter: ISearchReviewParam = {
      ...queryParams,
    }

    if (user.role === RoleEnum.CLIENT) {
      const client = await this.checkClient(queryParams.userId)

      filter.clientId = client.id
      filter.isClient = true
    }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.checkProvider(queryParams.userId)

      filter.providerId = provider.id
      filter.isProvider = true
    }

    return this.reviewRepository.findReviews(filter)
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'User not found',
      })
    }

    return user
  }

  private async checkClient(userId: number) {
    const client = await this.clientRepository.findClientByUserId(userId)

    if (!client) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkProvider(userId: number) {
    const provider = await this.providerRepository.findProviderByUserId(userId)

    if (!provider) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Provider not found',
      })
    }

    return provider
  }
}
