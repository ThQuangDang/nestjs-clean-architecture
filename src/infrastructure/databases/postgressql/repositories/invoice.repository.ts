/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { In, LessThanOrEqual, QueryRunner, Repository } from 'typeorm'

import {
  InvoiceEntity,
  InvoiceStatusEnum,
} from '@domain/entities/invoices.entity'
import {
  IInvoiceRepository,
  ISearchInvoiceParam,
} from '@domain/repositories/invoice.repository.interface'

import { Invoice } from '../entities/invoices.entity'

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async createInvoice(data: Partial<InvoiceEntity>) {
    const invoice = this.invoiceRepository.create(data)
    return await this.invoiceRepository.save(invoice)
  }

  async getInvoiceById(id: number, queryRunner?: QueryRunner) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Invoice)
      : this.invoiceRepository
    return await repository.findOne({
      where: { id },
    })
  }

  async updateInvoice(
    id: number[],
    invoice: Partial<InvoiceEntity>,
    queryRunner?: QueryRunner,
  ) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Invoice)
      : this.invoiceRepository
    const upInvoice = await repository.update(
      {
        id: In(id),
      },
      invoice,
    )

    if (upInvoice.affected === 0 || upInvoice.affected !== id.length)
      return false

    return true
  }

  async findInvoices(params: ISearchInvoiceParam) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'invoice.id',
        'invoice.totalAmount',
        'invoice.status',
        'invoice.issuedDate',
        'invoice.createdAt',
        'invoice.appointmentId',
        'invoice.providerId',
        'invoice.clientId',
      ])

    if (params.providerId) {
      query.andWhere('invoice.providerId = :providerId', {
        providerId: params.providerId,
      })
    }

    if (params.clientId) {
      query.andWhere('invoice.clientId = :clientId', {
        clientId: params.clientId,
      })
    }

    if (params.appointmentId) {
      query.andWhere('invoice.appointmentId = :appointmentId', {
        appointmentId: params.appointmentId,
      })
    }

    if (params.inDate) {
      const inDate = new Date(params.inDate)

      const startOfDay = new Date(inDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(inDate)
      endOfDay.setHours(23, 59, 59, 999)

      query.andWhere('invoice.issuedDate BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      })
    }

    if (params.status) {
      query.andWhere('invoice.status = :status', { status: params.status })
    }

    query.orderBy(`invoice.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)
    return query.getMany()
  }

  async getInvoiceByAppointmentId(appointmentId: number) {
    return this.invoiceRepository.findOne({
      where: { appointmentId },
    })
  }

  async findInvoicesExpried(now: Date) {
    return this.invoiceRepository.find({
      where: {
        status: InvoiceStatusEnum.PENDING,
        dueDate: LessThanOrEqual(now),
      },
    })
  }
}
