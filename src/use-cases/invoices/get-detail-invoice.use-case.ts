import { Inject, Injectable } from '@nestjs/common'

import { InvoiceEntity } from '@domain/entities/invoices.entity'
import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
} from '@domain/repositories/client.repository.interface'
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
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
export class GetDetailInvoiceUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(params: { userId: number; id: number }) {
    const user = await this.checkUser(params.userId)

    const invoice = await this.checkInvoice(params.id)

    if (user.role === RoleEnum.ADMIN) {
      return invoice
    }

    if (user.role === RoleEnum.PROVIDER) {
      await this.checkProvider(user.id, invoice)
      return invoice
    }

    if (user.role === RoleEnum.CLIENT) {
      await this.checkClient(user.id, invoice)
      return invoice
    }

    throw this.exceptionsService.forbiddenException({
      type: 'Forbidden',
      message: 'You are not authorized to view this invoice.',
    })
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

  private async checkInvoice(invoiceId: number) {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId)

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Invoice not found',
      })
    }

    return invoice
  }

  private async checkProvider(userId: number, invoice: InvoiceEntity) {
    const provider = await this.providerRepository.findProviderByUserId(userId)
    const isOwner = provider && provider.id === invoice.providerId
    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view your own invoice.',
      })
    }
  }

  private async checkClient(userId: number, invoice: InvoiceEntity) {
    const client = await this.clientRepository.findClientByUserId(userId)
    const isOwner = client && client.id === invoice.clientId
    if (!isOwner) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You can only view your own invoice',
      })
    }
  }
}
