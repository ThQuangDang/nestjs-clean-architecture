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
  InvoiceEntity,
  InvoiceStatusEnum,
} from '@domain/entities/invoices.entity'

import { Appointment } from './appointments.entity'
import { Client } from './clients.entity'
import { Payment } from './payments.entity'
import { Provider } from './providers.entity'
import { RefundRequest } from './refund_request.entity'

@Entity('invoices')
@Index('IDX_invoices_provider_id', ['provider'])
@Index('IDX_invoices_client_id', ['client'])
export class Invoice implements InvoiceEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_invoices_id',
  })
  public readonly id!: number

  @OneToOne(() => Appointment, (appointment) => appointment.invoice, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'appointment_id' })
  public appointment!: Appointment

  @ManyToOne(() => Provider, (provider) => provider.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @ManyToOne(() => Client, (client) => client.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'total_amount',
  })
  public totalAmount!: number

  @Column('smallint', { default: InvoiceStatusEnum.PENDING })
  public status!: InvoiceStatusEnum

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    name: 'issued_date',
  })
  public issuedDate!: Date

  @Column('timestamp', { nullable: true, name: 'due_date' })
  public dueDate?: Date

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @OneToOne(() => Payment, (payment) => payment.invoice)
  payment?: Payment

  @OneToMany(() => RefundRequest, (refundRequest) => refundRequest.invoice)
  refundRequests?: RefundRequest[]

  @Column('bigint', { nullable: false, name: 'appointment_id' })
  public appointmentId!: number

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number

  @Column('bigint', { nullable: false, name: 'client_id' })
  public clientId!: number
}
