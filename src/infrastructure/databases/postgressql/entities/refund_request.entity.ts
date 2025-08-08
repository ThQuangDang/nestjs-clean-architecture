import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  RefundRequestEntity,
  RefundStatusEnum,
} from '@domain/entities/refund_request.entity'

import { Client } from './clients.entity'
import { Invoice } from './invoices.entity'
import { User } from './user.entity'

@Entity('refund_requests')
@Index('IDX_refund_invoice_id', ['invoiceId'])
@Index('IDX_refund_client_id', ['clientId'])
@Index('IDX_refund_status', ['refundStatus'])
export class RefundRequest implements RefundRequestEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_refund_requests_id',
  })
  public readonly id!: number

  @ManyToOne(() => Invoice, (invoice) => invoice.refundRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'invoice_id' })
  public invoice!: Invoice

  @Column('bigint', { name: 'invoice_id', nullable: false })
  public invoiceId!: number

  @ManyToOne(() => Client, (client) => client.refundRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @Column('bigint', { name: 'client_id', nullable: false })
  public clientId!: number

  @ManyToOne(() => User, (user) => user.refundRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  public user!: User

  @Column('bigint', { name: 'user_id', nullable: true })
  public userId?: number

  @Column('text', { nullable: false, name: 'refund_reason' })
  public refundReason!: string

  @Column('smallint', {
    name: 'refund_status',
    nullable: false,
    default: RefundStatusEnum.NONE,
  })
  public refundStatus!: RefundStatusEnum

  @Column('text', { nullable: true, name: 'reject_reason' })
  public rejectReason?: string

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date
}
