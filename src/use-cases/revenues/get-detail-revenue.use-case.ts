import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IRevenueRepository,
  REVENUE_REPOSITORY,
} from '@domain/repositories/revenue.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetDetailRevenueUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(REVENUE_REPOSITORY)
    private readonly revenueRepository: IRevenueRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: { id: number; userId: number }) {
    const user = await this.userRepository.getUserById(params.userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    const revenue = await this.revenueRepository.findById(params.id)

    if (!revenue) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Revenue not found',
      })
    }

    if (user.role === RoleEnum.ADMIN) {
      return revenue
    }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.providerRepository.findProviderByUserId(
        params.userId,
      )

      if (!provider) {
        throw this.exceptionsService.notFoundException({
          type: 'Not Found',
          message: 'Provider not found',
        })
      }

      const isOwner = provider && revenue.providerId === provider.id

      if (!isOwner) {
        throw this.exceptionsService.forbiddenException({
          type: 'Forbidden',
          message: 'You can only view your own revenue.',
        })
      }

      return revenue
    }

    throw this.exceptionsService.forbiddenException({
      type: 'Forbidden',
      message: 'You are not authorized to view this revenue.',
    })
  }
}
