import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import {
  InvoiceEntity,
  InvoiceStatusEnum,
} from '@domain/entities/invoices.entity'
import { NotificationTypeEnum } from '@domain/entities/notifications.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'
import { RefundStatusEnum } from '@domain/entities/refund_request.entity'
import { UserEntity } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '@domain/repositories/appointment.repository.interface'
import {
  CLIENT_REPOSITORY,
  IClientRepository,
  IProfileUserPayload,
} from '@domain/repositories/client.repository.interface'
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
} from '@domain/repositories/invoice.repository.interface'
import {
  IRefundRequestRepository,
  REFUND_REQUEST_REPOSITORY,
} from '@domain/repositories/refund-request.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class RequestRefundByClientUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(REFUND_REQUEST_REPOSITORY)
    private readonly refundRequestRepository: IRefundRequestRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    params: { userId: number; invoiceId: number },
    payload: { refundReason: string },
  ) {
    const client = await this.checkClient(params.userId)

    const invoice = await this.checkInvoice(params.invoiceId, client.id)

    await this.checkAppointment(invoice.appointmentId)

    await this.checkRefundRequest(invoice.id, client.id)

    const adminUser = await this.checkAdminUser()

    this.sendNotification(client, invoice, adminUser, payload.refundReason)

    return await this.refundRequestRepository.createRefundRequest({
      invoiceId: invoice.id,
      clientId: client.id,
      refundReason: payload.refundReason,
      refundStatus: RefundStatusEnum.PENDING,
    })
  }

  private async checkInvoice(invoiceId: number, clientId: number) {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId)

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Invoice not found',
      })
    }

    if (invoice.clientId !== clientId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You are not authorized to request refund for this invoice.',
      })
    }

    if (invoice.status !== InvoiceStatusEnum.PAID) {
      throw this.exceptionsService.badRequestException({
        type: 'InvalidInvoiceStatus',
        message: `Refund request is only allowed for paid invoices. Current status: ${invoice.status}.`,
      })
    }

    return invoice
  }

  private async checkClient(userId: number) {
    const client = await this.clientRepository.findClientByUserId(userId)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkAppointment(appointmentId: number) {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }

    if (appointment.paymentStatus !== PaymentStatusEnum.COMPLETED) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Payment Status',
        message: `Only completed or partial refunded transactions can be refunded.`,
      })
    }
  }

  private async checkAdminUser() {
    const adminUser = await this.userRepository.getAdminUser()

    if (adminUser.length === 0) {
      throw this.exceptionsService.badRequestException({
        type: 'AdminUnavailable',
        message: 'No administrators available to receive refund requests.',
      })
    }

    return adminUser
  }

  private sendNotification(
    client: IProfileUserPayload,
    invoice: InvoiceEntity,
    adminUser: UserEntity[],
    refundReason: string,
  ) {
    const notificationTitle = `Yêu cầu hoàn tiền mới từ Client #${client.id}`
    const notificationMessage = `Client ${client.username} đã gửi yêu cầu hoàn tiền cho hóa đơn #${invoice.id}. Lý do: ${refundReason}. Tổng tiền hóa đơn: ${invoice.totalAmount}.`

    adminUser.map((admin) =>
      this.eventEmitter.emit('notification.sent', {
        subject: notificationTitle,
        text: notificationMessage,
        userId: admin.id,
        type: NotificationTypeEnum.WEB,
      }),
    )
  }

  private async checkRefundRequest(invoiceId: number, clientId: number) {
    const lastestRefund =
      await this.refundRequestRepository.findLastestByInvoiceId(invoiceId)

    if (lastestRefund) {
      if (lastestRefund.refundStatus === RefundStatusEnum.PENDING) {
        throw this.exceptionsService.badRequestException({
          type: 'RefundRequestExist',
          message: 'Refund request already pending',
        })
      }

      if (lastestRefund.refundStatus === RefundStatusEnum.APPROVED) {
        throw this.exceptionsService.badRequestException({
          type: 'RefundRequestApproved',
          message: 'Refund request already approved',
        })
      }
    }

    const count =
      await this.refundRequestRepository.countRetryByInvoiceAndClient(
        invoiceId,
        clientId,
      )
    const MAX_RETRY = 3
    if (count >= MAX_RETRY) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'Exceeded max refund attempts',
      })
    }
  }
}
