import { Inject, Injectable } from '@nestjs/common'

import Stripe from 'stripe'

import { InvoiceStatusEnum } from '@domain/entities/invoices.entity'
import {
  PaymentEntity,
  PaymentStatusEnum,
} from '@domain/entities/payments.entity'
import { RefundStatusEnum } from '@domain/entities/refund_request.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '@domain/repositories/appointment.repository.interface'
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
} from '@domain/repositories/invoice.repository.interface'
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@domain/repositories/payment.repository.interface'
import {
  IRefundRequestRepository,
  REFUND_REQUEST_REPOSITORY,
} from '@domain/repositories/refund-request.repository.interface'
import {
  IStripeService,
  STRIPE_SERVICE,
} from '@domain/services/stripe.interface'

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    @Inject(STRIPE_SERVICE)
    private readonly stripeService: IStripeService,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(REFUND_REQUEST_REPOSITORY)
    private readonly refundRequestRepository: IRefundRequestRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(
    params: { paymentId: number; userId: number },
    payload: { refundReason?: string },
  ) {
    const payment = await this.checkPayment(params.paymentId)

    const invoice = await this.checkInvoice(payment.invoiceId)

    await this.checkRefundRequest(invoice.id)

    await this.checkAppointment(payment.appointmentId)

    const refundResult = await this.createRefundPayment(
      payment,
      params.userId,
      payload.refundReason,
    )

    return refundResult
  }

  private async checkPayment(paymentId: number) {
    const payment = await this.paymentRepository.getPaymentById(paymentId)

    if (!payment) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Payment not found',
      })
    }

    if (payment.status !== PaymentStatusEnum.COMPLETED) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Payment Status',
        message: `Only completed or partial refunded transactions can be refunded. Current status: ${payment.status}.`,
      })
    }

    if (payment.refundAmount >= payment.amount) {
      throw this.exceptionsService.badRequestException({
        type: 'AlreadyFullyRefunded',
        message: 'This transaction has been refunded.',
      })
    }

    return payment
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

  private async createRefundPayment(
    payment: PaymentEntity,
    userId: number,
    refundReason?: string,
  ) {
    const validReasons = new Set([
      'duplicate',
      'fraudulent',
      'requested_by_customer',
    ])
    const reason = validReasons.has(refundReason!)
      ? (refundReason as 'duplicate' | 'fraudulent' | 'requested_by_customer')
      : undefined

    const amountInMinorUnits = Math.round(payment.amount * 100)

    const stripeTransactionId = payment.transactionId

    const refundResult: Stripe.Refund = await this.stripeService.createRefund({
      payment_intent: stripeTransactionId,
      amount: amountInMinorUnits,
      reason,
      metadata: {
        paymentId: payment.id.toString(),
        invoiceId: payment.invoiceId.toString(),
        appointmentId: payment.appointmentId.toString(),
        refundByUserId: userId.toString(),
        refundAmount: payment.amount.toString(),
      },
    })

    return refundResult
  }

  private async checkRefundRequest(invoiceId: number) {
    const refundRequest =
      await this.refundRequestRepository.findLastestByInvoiceId(invoiceId)

    if (!refundRequest) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Refudnd request not found',
      })
    }

    if (refundRequest.refundStatus !== RefundStatusEnum.APPROVED) {
      throw this.exceptionsService.badRequestException({
        type: 'InvalidStatus',
        message: `Refund request is already ${refundRequest.refundStatus} and cannot be changed.`,
      })
    }

    return refundRequest
  }

  private async checkInvoice(invoiceId: number) {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId)

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Invoice not found',
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
}
