import { PaymentStatusEnum } from './payments.entity'

export enum AppointmentStatusEnum {
  PENDING = 1,
  CONFIRMED = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export class AppointmentEntity {
  public readonly id!: number
  public clientId!: number
  public providerId!: number
  public serviceId!: number
  public appointmentTime!: Date
  public status!: AppointmentStatusEnum
  public paymentStatus!: PaymentStatusEnum
  public userIdReject?: number
  public cancelReason?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}
