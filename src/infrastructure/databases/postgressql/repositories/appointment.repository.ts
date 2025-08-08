/* eslint-disable import/named */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { In, QueryRunner, Repository } from 'typeorm'

import {
  AppointmentEntity,
  AppointmentStatusEnum,
} from '@domain/entities/appointments.entity'
import {
  IAppointmentRepository,
  ISearchAppointmentParam,
} from '@domain/repositories/appointment.repository.interface'

import { Appointment } from '../entities/appointments.entity'

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async createAppointment(data: Partial<AppointmentEntity>) {
    const appointment = this.appointmentRepository.create(data)
    return await this.appointmentRepository.save(appointment)
  }

  async updateAppointment(
    params: { id: number[] },
    appointment: Partial<AppointmentEntity>,
    queryRunner?: QueryRunner,
  ) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Appointment)
      : this.appointmentRepository
    const upAppointment = await repository.update(
      {
        id: In(params.id),
      },
      appointment,
    )

    if (
      upAppointment.affected === 0 ||
      upAppointment.affected !== params.id.length
    )
      return false

    return true
  }

  async getAppointmentById(id: number): Promise<
    | {
        id: number
        appointmenttime: Date
        status: AppointmentStatusEnum
        clientid: number
        providerid: number
        serviceid: number
        servicename: string
        price: number
        clientuserid: number
        provideruserid: number
      }
    | undefined
  > {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.service', 'service')
      .leftJoin('appointment.client', 'client')
      .leftJoin('appointment.provider', 'provider')
      .select([
        'appointment.id AS id',
        'appointment.appointmentTime AS appointmenttime',
        'appointment.status AS status',
        'appointment.clientId AS clientid',
        'appointment.providerId AS providerid',
        'appointment.serviceId AS serviceid',
        'service.name AS servicename',
        'service.price AS price',
        'client.userId AS clientuserid',
        'provider.userId AS provideruserid',
      ])
      .where('appointment.id = :id', { id })
      .getRawOne()
  }

  async findById(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<AppointmentEntity | null> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Appointment)
      : this.appointmentRepository
    return await repository.findOne({ where: { id } })
  }

  async findAppointments(params: ISearchAppointmentParam) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .select([
        'appointment.id',
        'appointment.clientId',
        'appointment.providerId',
        'appointment.serviceId',
        'appointment.appointmentTime',
        'appointment.status',
        'appointment.paymentStatus',
        'appointment.createdAt',
      ])

    if (params.clientId) {
      query.andWhere('appointment.clientId = :clientId', {
        clientId: params.clientId,
      })
    }

    if (params.providerId) {
      query.andWhere('appointment.providerId = :providerId', {
        providerId: params.providerId,
      })
    }

    if (params.serviceId) {
      query.andWhere('appointment.serviceId = :serviceId', {
        serviceId: params.serviceId,
      })
    }

    if (params.status) {
      query.andWhere('appointment.status = :status', { status: params.status })
    }

    if (params.paymentStatus) {
      query.andWhere('appointment.paymentStatus = :paymentStatus', {
        paymentStatus: params.paymentStatus,
      })
    }

    query.orderBy(`appointment.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)
    return query.getMany()
  }

  async findAppointmentByTime(
    clientId: number,
    appointmentTime: Date,
    appointmentId?: number,
  ) {
    const twentyMinutesBefore = new Date(
      appointmentTime.getTime() - 20 * 60 * 1000,
    )
    const twentyMinutesAfter = new Date(
      appointmentTime.getTime() + 20 * 60 * 1000,
    )

    const query = this.appointmentRepository.createQueryBuilder('appointment')

    if (appointmentId) {
      query.andWhere('appointment.id != :appointmentId', { appointmentId })
    }
    query
      .andWhere('appointment.clientId = :clientId', { clientId })
      .andWhere('appointment.appointmentTime BETWEEN :startTime AND :endTime', {
        startTime: twentyMinutesBefore,
        endTime: twentyMinutesAfter,
      })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [
          AppointmentStatusEnum.PENDING,
          AppointmentStatusEnum.CONFIRMED,
        ],
      })

    return query.getOne()
  }

  // async findAppointmentByTime(clientId: number, appointmentTime: Date, appointmentId?: number) {
  //   const twentyMinutesBefore = new Date(
  //     appointmentTime.getTime() - 20 * 60 * 1000,
  //   )
  //   const twentyMinutesAfter = new Date(
  //     appointmentTime.getTime() + 20 * 60 * 1000,
  //   )

  //   const query = this.appointmentRepository
  //     .createQueryBuilder('appointment')
  //     .where('appointment.clientId = :clientId', { clientId })
  //     .andWhere('appointment.appointmentTime BETWEEN :startTime AND :endTime', {
  //       startTime: twentyMinutesBefore,
  //       endTime: twentyMinutesAfter,
  //     })
  //     .andWhere('appointment.status IN (:...statuses)', {
  //       statuses: [
  //         AppointmentStatusEnum.PENDING,
  //         AppointmentStatusEnum.CONFIRMED,
  //       ],
  //     })

  //   return query.getOne()
  // }
}
