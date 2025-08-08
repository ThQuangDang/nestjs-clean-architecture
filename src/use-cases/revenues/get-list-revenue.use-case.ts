import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IRevenueOutput,
  IRevenueRepository,
  ISearchRevenueParam,
  REVENUE_REPOSITORY,
} from '@domain/repositories/revenue.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListRevenueUseCase {
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

  async execute(
    queryParams: ISearchRevenueParam & { userId: number },
  ): Promise<IRevenueOutput[]> {
    const user = await this.userRepository.getUserById(queryParams.userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User Not Found',
      })
    }

    const filter: ISearchRevenueParam = { ...queryParams }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.providerRepository.findProviderByUserId(
        queryParams.userId,
      )

      if (!provider) {
        throw this.exceptionsService.notFoundException({
          type: 'Not Found',
          message: 'Provider not found',
        })
      }

      filter.providerId = provider.id
    }

    const revenue = await this.revenueRepository.findRevenues(filter)

    return revenue
  }
}
