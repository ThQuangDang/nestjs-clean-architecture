/* eslint-disable import/named */
import { QueryRunner } from 'typeorm'

import { PaymentEntity } from '@domain/entities/payments.entity'

export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY_INTERFACE'

export interface IPaymentRepository {
  createPayment(payment: Partial<PaymentEntity>): Promise<PaymentEntity>
  findPendingPaymentByInvoiceId(
    invoiceId: number,
  ): Promise<PaymentEntity | null>
  updatePayment(
    id: number[],
    data: Partial<PaymentEntity>,
    queryRunner?: QueryRunner,
  ): Promise<boolean>
  findByTransactionId(
    transactionId: string,
    queryRunner?: QueryRunner,
  ): Promise<PaymentEntity | null>
  getPaymentById(id: number): Promise<PaymentEntity | null>
  findCompletedPaymentInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentEntity[]>
  findByInvoiceId(
    invoiceId: number[],
    queryRunner?: QueryRunner,
  ): Promise<PaymentEntity[]>
  findByAppoinmentId(appointmentId: number): Promise<PaymentEntity | null>
}
