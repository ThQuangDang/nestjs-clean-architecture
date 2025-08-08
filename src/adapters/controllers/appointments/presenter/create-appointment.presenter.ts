import { ApiProperty } from '@nestjs/swagger'

import { AppointmentStatusEnum } from '@domain/entities/appointments.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'

export class CreateAppointmentPresenter {
  @ApiProperty()
  id: number

  @ApiProperty()
  serviceId: number

  @ApiProperty()
  appointmentTime: Date

  @ApiProperty({
    required: true,
    enum: AppointmentStatusEnum,
    description: '1 = PENDING ,2 = CONFIRMED ,3 = COMPLETED , 4 = CANCELED',
  })
  status: AppointmentStatusEnum

  @ApiProperty({
    required: true,
    enum: PaymentStatusEnum,
    description: '1 = PENDING,2 = COMPLETED,3 = FAILED,4 = REFUNDED',
  })
  paymentStatus: PaymentStatusEnum

  constructor({
    id,
    serviceId,
    appointmentTime,
    status,
    paymentStatus,
  }: CreateAppointmentPresenter) {
    this.id = id
    this.serviceId = serviceId
    this.appointmentTime = appointmentTime
    this.status = status
    this.paymentStatus = paymentStatus
  }
}
