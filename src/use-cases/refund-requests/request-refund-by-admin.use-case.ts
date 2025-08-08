import { Inject, Injectable } from '@nestjs/common'

import {
  RefundRequestEntity,
  RefundStatusEnum,
} from '@domain/entities/refund_request.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
  IProfileUserPayload,
} from '@domain/repositories/client.repository.interface'
import {
  IRefundRequestRepository,
  REFUND_REQUEST_REPOSITORY,
} from '@domain/repositories/refund-request.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

@Injectable()
export class RequestRefundByAdminUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFUND_REQUEST_REPOSITORY)
    private readonly refundRequestRepository: IRefundRequestRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { id: number; userId: number },
    payload: { refundStatus: RefundStatusEnum; rejectReason?: string },
  ) {
    const user = await this.checkUser(params.userId)

    const refundRequest = await this.checkRefundRequest(params.id)

    const client = await this.checkClient(refundRequest.clientId)

    return await this.approvOrRejectRequest(
      refundRequest,
      payload.refundStatus,
      user.id,
      client,
      payload.rejectReason,
    )
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

  private async checkRefundRequest(id: number) {
    const refundRequest = await this.refundRequestRepository.findById(id)

    if (!refundRequest) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Refudnd request not found',
      })
    }

    if (refundRequest.refundStatus !== RefundStatusEnum.PENDING) {
      throw this.exceptionsService.badRequestException({
        type: 'InvalidStatus',
        message: `Refund request is already ${refundRequest.refundStatus} and cannot be changed.`,
      })
    }

    return refundRequest
  }

  private async approvOrRejectRequest(
    refundRequest: RefundRequestEntity,
    nextStatus: RefundStatusEnum,
    adminId: number,
    client: IProfileUserPayload,
    rejectReason?: string,
  ) {
    const success =
      await this.refundRequestRepository.updateRefundRequestStatus(
        refundRequest.id,
        nextStatus,
        adminId,
        rejectReason,
      )

    if (!success) {
      throw this.exceptionsService.internalServerErrorException({
        type: 'UpdateFailed',
        message: 'Failed to update refund request status.',
      })
    }

    if (nextStatus === RefundStatusEnum.APPROVED) {
      await this.gmailService.sendRefundApprovedNotification({
        userId: client.userid,
        clientEmail: client.email,
        clientName: client.username,
        refundRequestId: refundRequest.id,
        refundReason: refundRequest.refundReason,
      })
    }

    if (nextStatus === RefundStatusEnum.REJECTED) {
      await this.gmailService.sendRefundRejectedNotification({
        userId: client.userid,
        clientEmail: client.email,
        clientName: client.username,
        refundRequestId: refundRequest.id,
        refundReason: refundRequest.refundReason,
        rejectReason,
      })
    }

    return success
  }

  private async checkClient(clientId: number) {
    const client = await this.clientRepository.getClientById(clientId)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Client not found',
      })
    }

    return client
  }
}
