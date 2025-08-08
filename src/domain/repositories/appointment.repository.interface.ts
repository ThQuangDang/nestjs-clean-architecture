/* eslint-disable import/named */
import { QueryRunner } from 'typeorm'

import {
  AppointmentEntity,
  AppointmentStatusEnum,
} from '@domain/entities/appointments.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'

export const APPOINTMENT_REPOSITORY = 'APPOINTMENT_REPOSITORY_INTERFACE'

export interface ISearchAppointmentParam {
  status?: AppointmentStatusEnum
  paymentStatus?: PaymentStatusEnum
  sortBy?: 'createdAt' | 'appointmentTime'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  providerId?: number
  clientId?: number
  serviceId?: number
}

export interface IAppointmentService {
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

export interface IAppointmentRepository {
  createAppointment(
    data: Partial<AppointmentEntity>,
  ): Promise<AppointmentEntity>
  updateAppointment(
    params: {
      id: number[]
    },
    appointment: Partial<AppointmentEntity>,
    queryRunner?: QueryRunner,
  ): Promise<boolean>
  getAppointmentById(id: number): Promise<IAppointmentService | undefined>
  findById(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<AppointmentEntity | null>

  findAppointments(
    params: ISearchAppointmentParam,
  ): Promise<AppointmentEntity[]>
  findAppointmentByTime(
    clientId: number,
    appointmentTime: Date,
    appointmentId?: number,
  ): Promise<AppointmentEntity | null>
}
