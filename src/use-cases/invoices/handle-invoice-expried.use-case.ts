/* eslint-disable import/named */
import { Inject, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { DataSource, QueryRunner } from 'typeorm'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import {
  InvoiceEntity,
  InvoiceStatusEnum,
} from '@domain/entities/invoices.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '@domain/repositories/appointment.repository.interface'
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
  IPromotionUsageRepository,
  PROMOTION_USAGE_REPOSITORY,
} from '@domain/repositories/promotion-usage.repository.interface'
import {
  IPromotionRepository,
  PROMOTION_REPOSITORY,
} from '@domain/repositories/promotion.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

@Injectable()
export class HandleInvoiceExpriedUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(PROMOTION_USAGE_REPOSITORY)
    private readonly promotionUsageRepository: IPromotionUsageRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    private readonly datasource: DataSource,
  ) {}

  @Cron('0 0 * * * *')
  async execute() {
    const now = new Date()

    const expiredInvoices =
      await this.invoiceRepository.findInvoicesExpried(now)

    if (expiredInvoices.length === 0) return

    const appointmentIds = expiredInvoices.map((inv) => inv.appointmentId)
    const invoiceIds = expiredInvoices.map((inv) => inv.id)

    const queryRunner = this.datasource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      await this.updateAppointment(appointmentIds, queryRunner)

      await this.updateInvoice(invoiceIds, queryRunner)

      await this.updatePayment(invoiceIds, queryRunner)

      const allPromotionUsages =
        await this.promotionUsageRepository.getPromotionByAppointmentId(
          appointmentIds,
        )

      if (allPromotionUsages.length > 0) {
        const usageIds = allPromotionUsages.map((p) => p.id)

        await this.deletePromotionUsage(usageIds, queryRunner)

        const promotionUsageCount = new Map<number, number>()

        for (const promotionUsage of allPromotionUsages) {
          promotionUsageCount.set(
            promotionUsage.promotionId,
            (promotionUsageCount.get(promotionUsage.promotionId) || 0) + 1,
          )
        }

        for (const [promotionId, count] of promotionUsageCount.entries()) {
          await this.updatePromotion(promotionId, count, queryRunner)
        }
      }

      await this.sendMail(expiredInvoices)

      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction()
      }
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
      if (error instanceof Error) {
        throw this.exceptionsService.badRequestException({
          type: 'Bad Request',
          message: 'An error occurred while processing expired invoices.',
        })
      }
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async updateAppointment(
    appointmentIds: number[],
    queryRunner: QueryRunner,
  ) {
    const upAppointment = await this.appointmentRepository.updateAppointment(
      {
        id: appointmentIds,
      },
      {
        status: AppointmentStatusEnum.CANCELED,
        paymentStatus: PaymentStatusEnum.FAILED,
      },
      queryRunner,
    )

    if (!upAppointment) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Failed to update appointment statuses to CANCELED.',
      })
    }
  }

  private async updateInvoice(invoiceIds: number[], queryRunner: QueryRunner) {
    const upInvoice = await this.invoiceRepository.updateInvoice(
      invoiceIds,
      {
        status: InvoiceStatusEnum.CANCELED,
      },
      queryRunner,
    )

    if (!upInvoice) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Failed to update invoice statuses to CANCELED.',
      })
    }
  }

  private async deletePromotionUsage(
    usageIds: number[],
    queryRunner: QueryRunner,
  ) {
    const removePromotion = await this.promotionUsageRepository.deleteByIds(
      usageIds,
      queryRunner,
    )

    if (!removePromotion) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Failed to delete promotion usage records.',
      })
    }
  }

  private async updatePromotion(
    promotionId: number,
    count: number,
    queryRunner: QueryRunner,
  ) {
    const upPromotion = await this.promotionRepository.decrementUseCount(
      promotionId,
      count,
      queryRunner,
    )

    if (!upPromotion) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Failed to decrement promotion useCount.',
      })
    }
  }

  private async sendMail(expiredInvoices: InvoiceEntity[]) {
    const clientIds = expiredInvoices.map((inv) => inv.clientId)

    const clients = await this.clientRepository.findClientByIds(clientIds)

    if (
      clients == null ||
      clients.length === 0 ||
      clients.length !== clientIds.length
    ) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'Client not found',
      })
    }

    const clientMap = new Map<number, (typeof clients)[0]>()
    for (const client of clients) {
      clientMap.set(client.id, client)
    }

    for (const invoice of expiredInvoices) {
      const client = clientMap.get(invoice.clientId)
      if (!client) continue

      const appointment = await this.appointmentRepository.getAppointmentById(
        invoice.appointmentId,
      )

      if (!appointment) {
        throw this.exceptionsService.notFoundException({
          type: 'Not Found',
          message: 'Appointment not found',
        })
      }

      await this.gmailService.sendInvoiceCanceledMailToClient({
        userId: client.userid,
        clientName: client.username,
        clientEmail: client.email,
        invoiceId: invoice.id,
        appointmentDate: appointment.appointmenttime,
      })
    }
  }

  private async updatePayment(invoiceIds: number[], queryRunner: QueryRunner) {
    const payments = await this.paymentRepository.findByInvoiceId(invoiceIds)

    if (payments.length === 0) return

    const paymentIds = payments.map((pay) => pay.id)

    const upPayment = await this.paymentRepository.updatePayment(
      paymentIds,
      {
        status: PaymentStatusEnum.FAILED,
      },
      queryRunner,
    )

    if (!upPayment) {
      throw this.exceptionsService.badRequestException({
        type: 'Bad Request',
        message: 'Failed to update payment statuses to FAILED.',
      })
    }
  }
}
