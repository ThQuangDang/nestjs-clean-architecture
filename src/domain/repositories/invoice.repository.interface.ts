/* eslint-disable import/named */
import { QueryRunner } from 'typeorm'

import {
  InvoiceEntity,
  InvoiceStatusEnum,
} from '@domain/entities/invoices.entity'

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY_INTERFACE'

export interface ISearchInvoiceParam {
  status?: InvoiceStatusEnum
  inDate?: Date
  sortBy?: 'createdAt' | 'issuedDate'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  providerId?: number
  clientId?: number
  appointmentId?: number
}

export interface IInvoiceRepository {
  createInvoice(data: Partial<InvoiceEntity>): Promise<InvoiceEntity>
  getInvoiceById(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<InvoiceEntity | null>
  updateInvoice(
    id: number[],
    invoice: Partial<InvoiceEntity>,
    queryRunner?: QueryRunner,
  ): Promise<boolean>
  findInvoices(params: ISearchInvoiceParam): Promise<InvoiceEntity[]>
  getInvoiceByAppointmentId(
    appointmentId: number,
  ): Promise<InvoiceEntity | null>
  findInvoicesExpried(now: Date): Promise<InvoiceEntity[]>
}
