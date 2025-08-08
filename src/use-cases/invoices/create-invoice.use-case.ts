import { Inject, Injectable } from '@nestjs/common'

import { addHours } from 'date-fns'
import { DataSource } from 'typeorm'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import { InvoiceEntity } from '@domain/entities/invoices.entity'
import { PromotionEntity } from '@domain/entities/promotions.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
  IAppointmentService,
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
  IPromotionUsageRepository,
  PROMOTION_USAGE_REPOSITORY,
} from '@domain/repositories/promotion-usage.repository.interface'
import {
  IPromotionRepository,
  PROMOTION_REPOSITORY,
} from '@domain/repositories/promotion.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(PROMOTION_USAGE_REPOSITORY)
    private readonly promotionUsageRepository: IPromotionUsageRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    params: { userId: number; appointmentId: number },
    payload: {
      promotionCode?: string[]
    },
  ) {
    const client = await this.checkClient(params.userId)

    const appointment = await this.checkAppointment(
      params.appointmentId,
      client.id,
    )

    await this.checkAppointmentExist(appointment.id)

    let finalPrice = appointment.price

    if (payload.promotionCode && payload.promotionCode.length > 0) {
      const promotions = await this.checkPromotionCode(
        appointment.serviceid,
        client.id,
        payload.promotionCode,
      )

      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        const appliedPromotion: PromotionEntity[] = []

        for (const promo of promotions) {
          const incrementCountPromotion =
            await this.promotionRepository.tryIncrementUseCountAtomically(
              promo.id,
              queryRunner,
            )

          if (incrementCountPromotion) {
            await this.promotionUsageRepository.create(
              {
                promotionId: promo.id,
                clientId: client.id,
                appointmentId: appointment.id,
              },
              queryRunner,
            )
            appliedPromotion.push(promo)
          } else {
            throw this.exceptionsService.badRequestException({
              type: 'PromotionMaxUsageReached',
              message: `Promotion code ${promo.discountCode} has reached its usage limit.`,
            })
          }
        }

        const totalDiscountRate =
          appliedPromotion.reduce(
            (sum, promo) => sum + Number(promo.discount),
            0,
          ) / 100

        finalPrice = appointment.price * (1 - totalDiscountRate)

        if (finalPrice < 0) finalPrice = 0

        if (queryRunner.isTransactionActive) {
          await queryRunner.commitTransaction()
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction()
        }
        if (error instanceof Error) {
          throw this.exceptionsService.badRequestException({
            type: 'PromotionApplicationFailed',
            message: 'Failed to apply promotion code. Please try again.',
          })
        }
        throw error
      } finally {
        await queryRunner.release()
      }
    }

    const now = new Date()
    const dueDate = addHours(now, 24)

    const invoice = await this.invoiceRepository.createInvoice({
      totalAmount: finalPrice,
      dueDate: dueDate,
      appointmentId: appointment.id,
      providerId: appointment.providerid,
      clientId: client.id,
    })

    await this.sendMail(client, invoice, appointment)

    return invoice
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

  private async checkAppointment(appointmentId: number, clientId: number) {
    const appointment =
      await this.appointmentRepository.getAppointmentById(appointmentId)

    if (appointment == null) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Appointment not found',
      })
    }

    if (appointment.clientid !== clientId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You are not authorized to access this appointment',
      })
    }

    if (
      appointment.status === AppointmentStatusEnum.CANCELED ||
      appointment.status === AppointmentStatusEnum.PENDING
    ) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'Action not allowed for this appointment status',
      })
    }
    return appointment
  }

  private async checkPromotionCode(
    serviceId: number,
    clientId: number,
    codes: string[],
  ) {
    const promotions = await this.promotionRepository.findPromotionsByCodes(
      codes,
      serviceId,
      new Date(),
    )

    if (promotions.length !== codes.length) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Promotion not found',
      })
    }

    const usedPromotion =
      await this.promotionUsageRepository.checkUniquePromotionClient(
        clientId,
        promotions.map((p) => p.id),
      )

    if (usedPromotion) {
      throw this.exceptionsService.badRequestException({
        type: 'Promotion Limit',
        message: 'Client has already used one of these promotions',
      })
    }

    return promotions
  }

  private async checkAppointmentExist(appointmentId: number) {
    const appointment =
      await this.invoiceRepository.getInvoiceByAppointmentId(appointmentId)

    if (appointment) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'Appointment already exist',
      })
    }
  }

  private async sendMail(
    client: IProfileUserPayload,
    invoice: InvoiceEntity,
    appointment: IAppointmentService,
  ) {
    await this.gmailService.sendInvoiceCreatedAndReminderMailToClient({
      userId: client.userid,
      clientName: client.username,
      clientEmail: client.email,
      invoiceId: invoice.id,
      appointmentDate: appointment.appointmenttime,
      amount: invoice.totalAmount,
      dueDate: invoice.dueDate,
    })
  }
}
