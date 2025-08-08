/* eslint-disable import/named */
import { Inject, Injectable } from '@nestjs/common'

import Stripe from 'stripe'
import { DataSource, QueryRunner } from 'typeorm'

import { InvoiceStatusEnum } from '@domain/entities/invoices.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'
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
  IStripeService,
  STRIPE_SERVICE,
} from '@domain/services/stripe.interface'

import { LoggerService } from '@infrastructure/logger/logger.service'

@Injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    @Inject(STRIPE_SERVICE)
    private readonly stripeService: IStripeService,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {}

  async execute(rawPayload: string | Buffer, signature: string): Promise<void> {
    let event: Stripe.Event
    const webhookSecret = this.stripeService.getWebhookSecret()
    try {
      event = this.stripeService.verifyWebhookSignature(
        rawPayload,
        signature,
        webhookSecret,
      )
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        this.logger.warn('Webhook signature verification failed.', {
          message: error.message,
        })
        throw error
      }
      throw this.exceptionsService.internalServerErrorException({
        type: 'Webhook Processing Error',
        message: 'An error occurred while processing the webhook signature.',
      })
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const eventObject = event.data.object

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(
            eventObject as Stripe.PaymentIntent,
            queryRunner,
          )
          break

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(
            eventObject as Stripe.PaymentIntent,
            queryRunner,
          )
          break

        case 'charge.refunded':
          await this.handleChargeRefunded(
            eventObject as Stripe.Charge,
            queryRunner,
          )
          break

        default:
          this.logger.warn(
            'HandleStripeWebhookUseCase',
            `Unhandled Stripe event type: ${event.type}`,
          )
          break
      }

      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction()
      }
    } catch (error: unknown) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
      if (error instanceof Error) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Webhook Processing Error',
          message: `An error occurred while processing the event ${event.type}.`,
        })
      }
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    queryRunner: QueryRunner,
  ): Promise<void> {
    let metadata: ReturnType<typeof this.extractMetadata>
    try {
      metadata = this.extractMetadata(paymentIntent.metadata)
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw this.exceptionsService.internalServerErrorException({
          type: 'Webhook Processing Metadata',
          message: `An error occurred while processing the metadata ${error.message}.`,
        })
      }
      throw error
    }
    const transactionId = paymentIntent.id

    const payment = await this.paymentRepository.findByTransactionId(
      transactionId,
      queryRunner,
    )

    if (!payment) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: `Payment record not found for Payment Intent ID ${transactionId} (payment_intent.succeeded).`,
      })
    }

    if (payment.status === PaymentStatusEnum.COMPLETED) {
      this.logger.warn(
        'HandleStripeWebhookUseCase',
        `Payment ${payment.id} for PI ${transactionId} with status ${PaymentStatusEnum[payment.status]}.`,
      )
    } else if (
      payment.status === PaymentStatusEnum.FAILED ||
      payment.status === PaymentStatusEnum.REFUNDED
    ) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Payment Status',
        message: `Payment ${payment.id} for Payment Intent ${transactionId} is in an unexpected state (${PaymentStatusEnum[payment.status]}) when receiving 'succeeded' event.`,
      })
    }

    await this.paymentRepository.updatePayment(
      [payment.id],
      { status: PaymentStatusEnum.COMPLETED },
      queryRunner,
    )

    const invoice = await this.invoiceRepository.getInvoiceById(
      metadata.invoiceId,
      queryRunner,
    )

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Invoice Not Found',
        message: `Invoice with ID ${metadata.invoiceId} not found (payment_intent.succeeded for Payment Intent ${transactionId}).`,
      })
    }

    if (invoice.status === InvoiceStatusEnum.PAID) {
      this.logger.warn(
        'HandleStripeWebhookUseCase',
        `Invoice ${invoice.id} cho PI ${transactionId} đã ${InvoiceStatusEnum[invoice.status]}.`,
      )
    } else if (
      invoice.status === InvoiceStatusEnum.CANCELED ||
      invoice.status === InvoiceStatusEnum.REFUNDED
    ) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Invoice Status',
        message: `Invoice ${invoice.id} for Payment Intent ${transactionId} is in an unexpected status (${InvoiceStatusEnum[invoice.status]}) when receiving 'succeeded' event.`,
      })
    } else if (invoice.status === InvoiceStatusEnum.PENDING) {
      await this.invoiceRepository.updateInvoice(
        [invoice.id],
        { status: InvoiceStatusEnum.PAID },
        queryRunner,
      )
    }

    const appointment = await this.appointmentRepository.findById(
      metadata.appointmentId,
      queryRunner,
    )
    if (!appointment) {
      throw this.exceptionsService.notFoundException({
        type: 'Appointment Not Found',
        message: `Appointment with ID ${metadata.appointmentId} not found (payment_intent.succeeded for Payment Intent ${transactionId}).`,
      })
    }

    if (appointment.paymentStatus === PaymentStatusEnum.COMPLETED) {
      this.logger.warn(
        'HandleStripeWebhookUseCase',
        `Appointment ${appointment.id} payment status with status ${PaymentStatusEnum[appointment.paymentStatus]}.`,
      )
    } else if (appointment.paymentStatus !== PaymentStatusEnum.PENDING) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Payment Status',
        message: `Appointment ${appointment.id} has an unexpected payment status (${PaymentStatusEnum[appointment.paymentStatus]}) when receiving 'failed' event.`,
      })
    } else {
      await this.appointmentRepository.updateAppointment(
        { id: [appointment.id] },
        { paymentStatus: PaymentStatusEnum.COMPLETED },
        queryRunner,
      )
    }
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const MAX_COUNT_RETRY = 3
    let metadata: ReturnType<typeof this.extractMetadata>
    try {
      metadata = this.extractMetadata(paymentIntent.metadata)
    } catch (error: unknown) {
      this.logger.error(
        'Webhook Error: Invalid or missing metadata in payment_intent.payment_failed event.',
        { error, paymentIntentId: paymentIntent.id },
      )
      return
    }

    const transactionId = paymentIntent.id

    const payment = await this.paymentRepository.findByTransactionId(
      transactionId,
      queryRunner,
    )

    if (!payment) {
      throw this.exceptionsService.notFoundException({
        type: 'Payment Not Found',
        message: `Payment record not found for Payment Intent ID ${transactionId} (payment_intent.succeeded).`,
      })
    }

    if (payment.retryCount + 1 > MAX_COUNT_RETRY) {
      if (payment.status === PaymentStatusEnum.FAILED) {
        this.logger.warn(
          'HandleStripeWebhookUseCase',
          `Payment ${payment.id} for PI ${transactionId} with status ${PaymentStatusEnum[payment.status]}.`,
        )
      } else if (payment.status !== PaymentStatusEnum.PENDING) {
        throw this.exceptionsService.badRequestException({
          type: 'Invalid Payment Status',
          message: `Payment ${payment.id} for Payment Intent ${transactionId} is in an unexpected state (${PaymentStatusEnum[payment.status]}) when receiving 'succeeded' event. Expected: PENDING.`,
        })
      }

      await this.paymentRepository.updatePayment(
        [payment.id],
        { status: PaymentStatusEnum.FAILED },
        queryRunner,
      )

      const invoice = await this.invoiceRepository.getInvoiceById(
        metadata.invoiceId,
        queryRunner,
      )

      if (!invoice) {
        throw this.exceptionsService.notFoundException({
          type: 'Invoice Not Found',
          message: `Invoice with ID ${metadata.invoiceId} not found (payment_intent.succeeded for Payment Intent ${transactionId}).`,
        })
      }

      if (invoice.status !== InvoiceStatusEnum.PENDING) {
        this.logger.warn(
          `Webhook Warning: Hóa đơn ${invoice.id} liên quan đến PI ${transactionId} đang ở trạng thái ${InvoiceStatusEnum[invoice.status]} sau khi payment failed.`,
          {
            invoiceId: invoice.id,
            currentInvoiceStatus: invoice.status,
            paymentIntentId: transactionId,
          },
        )
      }

      const appointment = await this.appointmentRepository.findById(
        metadata.appointmentId,
        queryRunner,
      )

      if (!appointment) {
        throw this.exceptionsService.notFoundException({
          type: 'Appointment Not Found',
          message: `Appointment with ID ${metadata.appointmentId} not found (payment_intent.payment_failed for Payment Intent ${transactionId}).`,
        })
      }

      if (appointment.paymentStatus === PaymentStatusEnum.FAILED) {
        this.logger.warn(
          'HandleStripeWebhookUseCase',
          `Appointment ${appointment.id} payment status  ${PaymentStatusEnum[appointment.paymentStatus]}.`,
        )
      } else if (appointment.paymentStatus !== PaymentStatusEnum.PENDING) {
        throw this.exceptionsService.badRequestException({
          type: 'Invalid Payment Status',
          message: `Appointment ${appointment.id} has an unexpected payment status (${PaymentStatusEnum[appointment.paymentStatus]}) when receiving 'failed' event.`,
        })
      } else {
        await this.appointmentRepository.updateAppointment(
          { id: [appointment.id] },
          { paymentStatus: PaymentStatusEnum.FAILED },
          queryRunner,
        )
      }
    } else {
      await this.paymentRepository.updatePayment(
        [payment.id],
        { retryCount: payment.retryCount + 1 },
        queryRunner,
      )
    }
  }

  private async handleChargeRefunded(
    charge: Stripe.Charge,
    queryRunner: QueryRunner,
  ): Promise<void> {
    let metadata: ReturnType<typeof this.extractMetadata>
    try {
      metadata = this.extractMetadata(
        charge.metadata ||
          (charge.payment_intent as Stripe.PaymentIntent)?.metadata,
      )
    } catch (error: unknown) {
      this.logger.error(
        'Webhook Error: Invalid or missing metadata in charge.refunded event.',
        { error, chargeId: charge.id },
      )
      return
    }

    const originalChargeId = charge.id
    const originalPaymentIntentId = charge.payment_intent as string

    if (!originalPaymentIntentId) {
      throw this.exceptionsService.badRequestException({
        type: 'Missing Payment Intent',
        message: `Charge ${originalChargeId} (refunded event) is not linked to a Payment Intent.`,
      })
    }

    const originalPayment = await this.paymentRepository.findByTransactionId(
      originalPaymentIntentId,
      queryRunner,
    )

    if (!originalPayment) {
      throw this.exceptionsService.notFoundException({
        type: 'Payment Not Found',
        message: `Payment record not found for Payment Intent ID ${originalPaymentIntentId} (charge.refunded for Charge ${originalChargeId}).`,
      })
    }

    if (originalPayment.status !== PaymentStatusEnum.COMPLETED) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Original Payment Status',
        message: `Payment ${originalPayment.id} for Charge ${originalChargeId} is in an unexpected status (${PaymentStatusEnum[originalPayment.status]}) when receiving 'refunded' event.`,
      })
    }

    const totalRefundedAmount = charge.amount_refunded / 100

    await this.paymentRepository.updatePayment(
      [originalPayment.id],
      {
        status: PaymentStatusEnum.REFUNDED,
        refundAmount: totalRefundedAmount,
      },
      queryRunner,
    )

    const invoice = await this.invoiceRepository.getInvoiceById(
      metadata.invoiceId,
      queryRunner,
    )

    if (!invoice) {
      throw this.exceptionsService.notFoundException({
        type: 'Invoice Not Found',
        message: `Webhook Error: Invoice with ID ${metadata.invoiceId} not found (charge.refunded for Charge ${originalChargeId}).`,
      })
    } else {
      if (invoice.status !== InvoiceStatusEnum.PAID) {
        throw this.exceptionsService.badRequestException({
          type: 'Invalid Invoice Status',
          message: `Invoice ${invoice.id} for Charge ${originalChargeId} is in an unexpected status (${InvoiceStatusEnum[invoice.status]}) when receiving 'refunded' event.`,
        })
      }

      await this.invoiceRepository.updateInvoice(
        [invoice.id],
        {
          status: InvoiceStatusEnum.REFUNDED,
        },
        queryRunner,
      )
    }

    const appointment = await this.appointmentRepository.findById(
      originalPayment.appointmentId,
      queryRunner,
    )
    if (!appointment) {
      throw this.exceptionsService.notFoundException({
        type: 'Appointment Not Found',
        message: `Appointment with ID ${metadata.appointmentId} not found (charge.refunded for Charge ${originalChargeId}).`,
      })
    } else {
      if (appointment.paymentStatus !== PaymentStatusEnum.COMPLETED) {
        throw this.exceptionsService.badRequestException({
          type: 'Invalid Payment Status',
          message: `Appointment ${appointment.id} has an unexpected payment status (${PaymentStatusEnum[appointment.paymentStatus]}) when receiving 'refunded' event.`,
        })
      } else {
        await this.appointmentRepository.updateAppointment(
          { id: [appointment.id] },
          { paymentStatus: PaymentStatusEnum.REFUNDED },
          queryRunner,
        )
      }
    }
  }

  private extractMetadata(metadata: Stripe.Metadata | null | undefined): {
    invoiceId: number
    appointmentId: number
    clientId: number
    providerId: number
  } {
    if (!metadata) {
      throw new Error('Metadata is missing')
    }
    const invoiceId = parseInt(metadata.invoiceId, 10)
    const appointmentId = parseInt(metadata.appointmentId, 10)
    const clientId = parseInt(metadata.clientId, 10)
    const providerId = parseInt(metadata.providerId, 10)

    if (
      isNaN(invoiceId) ||
      isNaN(appointmentId) ||
      isNaN(clientId) ||
      isNaN(providerId)
    ) {
      throw this.exceptionsService.badRequestException({
        type: 'Invalid Metadata',
        message: 'Invalid metadata IDs.',
      })
    }

    return { invoiceId, appointmentId, clientId, providerId }
  }
}
