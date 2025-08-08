/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { In, QueryRunner, Repository } from 'typeorm'

import {
  PaymentEntity,
  PaymentStatusEnum,
} from '@domain/entities/payments.entity'
import { IPaymentRepository } from '@domain/repositories/payment.repository.interface'

import { Payment } from '../entities/payments.entity'

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(data: Partial<PaymentEntity>) {
    const payment = this.paymentRepository.create(data)
    return await this.paymentRepository.save(payment)
  }

  async findPendingPaymentByInvoiceId(invoiceId: number) {
    return await this.paymentRepository.findOne({
      where: { invoiceId, status: PaymentStatusEnum.PENDING },
    })
  }

  async updatePayment(
    id: number[],
    data: Partial<PaymentEntity>,
    queryRunner?: QueryRunner,
  ) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Payment)
      : this.paymentRepository
    const upPayment = await repository.update(
      {
        id: In(id),
      },
      data,
    )

    if (upPayment.affected == 0 || upPayment.affected !== id.length)
      return false

    return true
  }

  async findByTransactionId(
    transactionId: string,
    queryRunner?: QueryRunner,
  ): Promise<PaymentEntity | null> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Payment)
      : this.paymentRepository
    return await repository.findOne({ where: { transactionId } })
  }

  async getPaymentById(id: number) {
    return await this.paymentRepository.findOne({ where: { id } })
  }

  async findCompletedPaymentInDateRange(startDate: Date, endDate: Date) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select([
        'payment.id',
        'payment.amount',
        'payment.status',
        'payment.updatedAt',
        'payment.appointmentId',
        'payment.providerId',
        'payment.refundAmount',
      ])
      .andWhere('payment.status IN (:...statuses)', {
        statuses: [PaymentStatusEnum.COMPLETED],
      })
      .andWhere('payment.updatedAt >= :startDate', { startDate })
      .andWhere('payment.updatedAt <= :endDate', { endDate })

    return query.getMany()
  }

  async findByInvoiceId(invoiceId: number[], queryRunner?: QueryRunner) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Payment)
      : this.paymentRepository

    return repository.find({
      where: { invoiceId: In(invoiceId) },
    })
  }

  async findByAppoinmentId(appointmentId: number) {
    return await this.paymentRepository.findOne({
      where: { appointmentId },
    })
  }
}
