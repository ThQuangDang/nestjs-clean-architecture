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
  REVIEW_REPOSITORY,
} from '@domain/repositories/review.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetDetailReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: { id: number; userId: number }) {
    const user = await this.userRepository.getUserById(params.userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'User not found',
      })
    }

    const review = await this.reviewRepository.getReviewById(params.id)

    if (!review) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Review not found',
      })
    }

    if (user.role === RoleEnum.ADMIN) {
      return review
    }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.providerRepository.findProviderByUserId(
        params.userId,
      )

      const isOwner = provider && provider.id === review.providerId
      if (!isOwner) {
        throw this.exceptionsService.forbiddenException({
          type: 'Forbidden',
          message: 'You can only view your own appointments.',
        })
      }

      return review
    }

    if (user.role === RoleEnum.CLIENT) {
      const client = await this.clientRepository.findClientByUserId(
        params.userId,
      )

      const isOwner = client && client.id === review.clientId
      if (!isOwner) {
        throw this.exceptionsService.forbiddenException({
          type: 'Forbidden',
          message: 'You can only view your own appointments.',
        })
      }

      return review
    }

    throw this.exceptionsService.forbiddenException({
      type: 'Forbidden',
      message: 'You are not authorized to view this review.',
    })
  }
}
