import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  AppointmentEntity,
  AppointmentStatusEnum,
} from '@domain/entities/appointments.entity'
import { PaymentStatusEnum } from '@domain/entities/payments.entity'

import { Client } from './clients.entity'
import { Invoice } from './invoices.entity'
import { Payment } from './payments.entity'
import { PromotionUsage } from './promotions_usage.entity'
import { Provider } from './providers.entity'
import { Review } from './reviews.entity'
import { Service } from './services.entity'
import { User } from './user.entity'

@Entity('appointments')
@Index('IDX_appointments_client_id', ['client'])
@Index('IDX_appointments_provider_id', ['provider'])
@Index('IDX_appointments_service_id', ['service'])
@Index('IDX_appointments_time', ['appointmentTime'])
export class Appointment implements AppointmentEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_appointments_id',
  })
  public readonly id!: number

  @ManyToOne(() => Client, (client) => client.appointments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @ManyToOne(() => Provider, (provider) => provider.appointments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @ManyToOne(() => Service, (service) => service.appointments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'service_id' })
  public service!: Service

  @Column('timestamp', { nullable: false, name: 'appointment_time' })
  public appointmentTime!: Date

  @Column('smallint', { default: AppointmentStatusEnum.PENDING })
  public status!: AppointmentStatusEnum

  @Column('smallint', {
    default: PaymentStatusEnum.PENDING,
    name: 'payment_status',
  })
  public paymentStatus!: PaymentStatusEnum

  @ManyToOne(() => User, (user) => user.appointments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id_reject' })
  public user!: User

  @Column('bigint', { nullable: true, name: 'user_id_reject' })
  public userIdReject?: number

  @Column('varchar', { length: 255, nullable: true, name: 'cancel_reason' })
  public cancelReason?: string

  @OneToOne(() => Payment, (payment) => payment.appointment)
  payment?: Payment

  @OneToOne(() => Invoice, (invoice) => invoice.appointment)
  invoice?: Invoice

  @OneToOne(() => Review, (review) => review.appointment)
  review?: Review

  @OneToMany(
    () => PromotionUsage,
    (promotionUsage) => promotionUsage.appointment,
  )
  promotionUsages?: PromotionUsage[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'client_id' })
  public clientId!: number

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number

  @Column('bigint', { nullable: false, name: 'service_id' })
  public serviceId!: number
}
