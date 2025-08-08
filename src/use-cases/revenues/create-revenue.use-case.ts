import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { endOfMonth, startOfMonth, subMonths } from 'date-fns'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import { IProfileUserPayload } from '@domain/repositories/client.repository.interface'
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@domain/repositories/payment.repository.interface'
import {
  IProviderRepository,
  PROVIDER_REPOSITORY,
} from '@domain/repositories/provider.repository.interface'
import {
  IRevenueRepository,
  REVENUE_REPOSITORY,
} from '@domain/repositories/revenue.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

@Injectable()
export class CreateRevenueUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(REVENUE_REPOSITORY)
    private readonly revenueRepository: IRevenueRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: IProviderRepository,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(EXCEPTIONS)
    private readonly execptionsService: IException,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async execute() {
    const commissionRate = 0.079
    const now = new Date()
    const previousMonth = subMonths(now, 1)
    const startOfPreviousMonth = startOfMonth(previousMonth)
    const endOfPreviousMonth = endOfMonth(previousMonth)

    const paymentCompletedMonth =
      await this.paymentRepository.findCompletedPaymentInDateRange(
        startOfPreviousMonth,
        endOfPreviousMonth,
      )

    const revenueByProvider = new Map<
      number,
      { totalIncome: number; totalPayment: number }
    >()

    for (const payment of paymentCompletedMonth) {
      const currentRevenue = revenueByProvider.get(payment.providerId) || {
        totalIncome: 0,
        totalPayment: 0,
      }
      currentRevenue.totalIncome += Number(payment.amount)
      currentRevenue.totalPayment += 1
      revenueByProvider.set(payment.providerId, currentRevenue)
    }

    for (const [providerId, data] of revenueByProvider.entries()) {
      const totalIncome = data.totalIncome
      const commission = totalIncome * commissionRate
      const netIncome = totalIncome - commission

      if (isNaN(totalIncome) || isNaN(commission) || isNaN(netIncome)) {
        throw this.execptionsService.badRequestException({
          type: 'Invalid',
          message: 'Invalid data',
        })
      }

      const revenueRecord =
        await this.revenueRepository.findByProviderIdAndMonth(
          providerId,
          startOfPreviousMonth,
        )

      if (revenueRecord) {
        revenueRecord.totalIncome = totalIncome
        revenueRecord.commission = commission
        revenueRecord.netIncome = netIncome
        const updateRevenue = await this.revenueRepository.updateRevenue(
          { id: revenueRecord.id },
          revenueRecord,
        )

        if (!updateRevenue) {
          throw this.execptionsService.badRequestException({
            type: 'Bad request',
            message: 'An error occurred while processing the update revenue',
          })
        }
      } else {
        await this.revenueRepository.createRevenue({
          providerId: providerId,
          month: startOfPreviousMonth,
          totalIncome: totalIncome,
          commission: commission,
          netIncome: netIncome,
        })
      }

      const provider = await this.providerRepository.getProviderById(providerId)

      if (!provider) {
        throw this.execptionsService.notFoundException({
          type: 'Not Found',
          message: 'Provider not found',
        })
      }

      await this.sendMail(
        provider,
        startOfPreviousMonth,
        totalIncome,
        data.totalPayment,
      )
    }
  }

  private async sendMail(
    provider: IProfileUserPayload,
    month: Date,
    totalRevenue: number,
    totalPayment: number,
  ): Promise<void> {
    await this.gmailService.sendMailMonthlyRevenueReportToProvider({
      userId: provider.userid,
      providerEmail: provider.email,
      providerName: provider.username,
      month: month,
      totalRevenue: totalRevenue,
      totalPayment: totalPayment,
    })
  }
}
