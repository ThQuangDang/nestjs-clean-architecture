import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
  ISearchInvoiceParam,
} from '@domain/repositories/invoice.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListInvoiceUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchInvoiceParam & { userId: number }) {
    const user = await this.userRepository.getUserById(queryParams.userId)
    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    const filter: ISearchInvoiceParam = {
      ...queryParams,
    }

    if (user.role === RoleEnum.PROVIDER) {
      const provider = await this.providerRepository.findProviderByUserId(
        user.id,
      )
      if (!provider) {
        throw this.exceptionsService.notFoundException({
          type: 'Not Found',
          message: 'Provider not found',
        })
      }

      filter.providerId = provider.id
    } else if (user.role === RoleEnum.CLIENT) {
      const client = await this.clientRepository.findClientByUserId(user.id)
      if (!client) {
        throw this.exceptionsService.notFoundException({
          type: 'Not Found',
          message: 'Client not found',
        })
      }

      filter.clientId = client.id
    }

    const invoices = await this.invoiceRepository.findInvoices(filter)

    return invoices
  }
}
