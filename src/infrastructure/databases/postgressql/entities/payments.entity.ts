import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  PaymentEntity,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '@domain/entities/payments.entity'

import { Appointment } from './appointments.entity'
import { Client } from './clients.entity'
import { Invoice } from './invoices.entity'
import { Provider } from './providers.entity'

@Entity('payments')
@Index('IDX_payments_client_id', ['client'])
@Index('IDX_payments_provider_id', ['provider'])
@Index('IDX_payments_transaction_id', ['transactionId'], { unique: true })
export class Payment implements PaymentEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_payments_id',
  })
  public readonly id!: number

  @OneToOne(() => Appointment, (appointment) => appointment.payment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'appointment_id' })
  public appointment!: Appointment

  @ManyToOne(() => Client, (client) => client.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @ManyToOne(() => Provider, (provider) => provider.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @OneToOne(() => Invoice, (invoice) => invoice.payment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'invoice_id' })
  public invoice!: Invoice

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  public amount!: number

  @Column('smallint', { default: PaymentStatusEnum.PENDING })
  public status!: PaymentStatusEnum

  @Column('smallint', {
    default: PaymentMethodEnum.STRIPE,
    name: 'payment_method',
  })
  public paymentMethod!: PaymentMethodEnum

  @Column('varchar', {
    length: 255,
    unique: true,
    nullable: false,
    name: 'transaction_id',
  })
  public transactionId!: string

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
    name: 'refund_amount',
  })
  public refundAmount!: number

  @Column('smallint', {
    nullable: false,
    default: 0,
    name: 'retry_count',
  })
  public retryCount!: number

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'appointment_id' })
  public appointmentId!: number

  @Column('bigint', { nullable: false, name: 'client_id' })
  public clientId!: number

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number

  @Column('bigint', { nullable: false, name: 'invoice_id' })
  public invoiceId!: number
}
