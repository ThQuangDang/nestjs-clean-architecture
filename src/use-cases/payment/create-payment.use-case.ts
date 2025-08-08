import { Inject, Injectable } from '@nestjs/common'

import Stripe from 'stripe'

import { InvoiceStatusEnum } from '@domain/entities/invoices.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'
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
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@domain/repositories/payment.repository.interface'
import {
  IStripeService,
  STRIPE_SERVICE,
} from '@domain/services/stripe.interface'

import { LoggerService } from '@infrastructure/logger/logger.service'

@Injectable()
export class InitiatePaymentUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(STRIPE_SERVICE)
    private readonly stripeService: IStripeService,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    private readonly logger: LoggerService,
  ) {}

  async execute(params: { userId: number; invoiceId: number }) {
    const client = await this.checkClient(params.userId)

    const invoice = await this.checkInvoice(params.invoiceId, client.id)

    const existingPendingPayment =
      await this.paymentRepository.findPendingPaymentByInvoiceId(invoice.id)

    if (existingPendingPayment) {
      let existingPaymentIntent: Stripe.PaymentIntent
      try {
        existingPaymentIntent = await this.stripeService.retrievePaymentIntent(
          existingPendingPayment.transactionId,
        )
        return {
          clientSecret: existingPaymentIntent.client_secret!,
          publishableKey: this.stripeService.getPublishableKey(),
          paymentId: existingPendingPayment.id,
        }
      } catch (error: unknown) {
        this.logger.error(
          'InitiatePaymentUseCase',
          `Failed to retrieve existing Stripe Payment Intent ${existingPendingPayment.transactionId} for Payment ID ${existingPendingPayment.id}.`,
          error instanceof Error ? error.stack : undefined,
        )

        try {
          await this.paymentRepository.updatePayment(
            [existingPendingPayment.id],
            { status: PaymentStatusEnum.FAILED },
          )
        } catch (dbError: unknown) {
          this.logger.error(
            'InitiatePaymentUseCase',
            `FATAL ERROR: Failed to mark existing PENDING payment ${existingPendingPayment.id} as FAILED after Stripe PI retrieval failed. Manual intervention needed.`,
            dbError instanceof Error ? dbError.stack : undefined,
          )
          throw this.exceptionsService.internalServerErrorException({
            type: 'Database Error',
            message: 'Có lỗi xảy ra khi cập nhật trạng thái giao dịch cũ.',
          })
        }

        throw this.exceptionsService.badRequestException({
          type: 'Payment Initiation Failed',
          message:
            'Yêu cầu thanh toán trước đó không thể tiếp tục. Vui lòng thử lại.',
        })
      }
    }

    let paymentIntent: Stripe.PaymentIntent | undefined
    try {
      const amountInMinorUnits = Math.round(invoice.totalAmount * 100)
      const currency = 'usd'

      paymentIntent = await this.stripeService.createPaymentIntent({
        amount: amountInMinorUnits,
        currency: currency,
        metadata: {
          invoiceId: invoice.id.toString(),
          clientId: client.id.toString(),
          appointmentId: invoice.appointmentId.toString(),
          providerId: invoice.providerId.toString(),
          userId: params.userId.toString(),
        },
      })

      const newPayment = await this.paymentRepository.createPayment({
        invoiceId: invoice.id,
        appointmentId: invoice.appointmentId,
        clientId: client.id,
        providerId: invoice.providerId,
        amount: invoice.totalAmount,
        transactionId: paymentIntent.id,
      })

      return {
        clientSecret: paymentIntent.client_secret!,
        publishableKey: this.stripeService.getPublishableKey(),
        paymentId: newPayment.id,
      }
    } catch (error: unknown) {
      if (paymentIntent && paymentIntent.id) {
        try {
          await this.stripeService.cancelPaymentIntent(paymentIntent.id)
        } catch (cancelError) {
          this.logger.error(
            'InitiatePaymentUseCase',
            `Failed to cancel Stripe Payment Intent ${paymentIntent.id} after DB save error. Manual intervention may be needed.`,
            cancelError instanceof Error ? cancelError.stack : undefined,
          )
        }
      }

      if (error instanceof Stripe.errors.StripeError) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Payment Gateway Error',
          message:
            error.message || 'Có lỗi xảy ra khi giao tiếp với cổng thanh toán.',
        })
      } else if (error instanceof Error) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Internal Server Error',
          message: error.message || 'Có lỗi nội bộ xảy ra.',
        })
      } else {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Unexpected Error',
          message: 'Có lỗi không xác định xảy ra.',
        })
      }
    }
  }

  private async checkClient(id: number) {
    const client = await this.clientRepository.findClientByUserId(id)

    if (client == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Client not found',
      })
    }

    return client
  }

  private async checkInvoice(invoiceId: number, clientId: number) {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId)

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: `Không tìm thấy hóa đơn ID ${invoiceId}.`,
      })
    }

    if (invoice.clientId !== clientId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You are not authorized to access this invoice',
      })
    }

    if (invoice.status !== InvoiceStatusEnum.PENDING) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Invoice Status',
        message: `Hóa đơn ID ${invoiceId} không ở trạng thái chờ thanh toán (${InvoiceStatusEnum.PENDING}). Trạng thái hiện tại: ${invoice.status}.`,
      })
    }

    return invoice
  }
}
