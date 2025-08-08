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

import { ReviewEntity, ReviewStatusEnum } from '@domain/entities/reviews.entity'

import { Appointment } from './appointments.entity'
import { Client } from './clients.entity'
import { Provider } from './providers.entity'
import { Service } from './services.entity'

@Entity('reviews')
@Index('IDX_reviews_client_id', ['client'])
@Index('IDX_reviews_provider_id', ['provider'])
@Index('IDX_reviews_service_id', ['service'])
@Index('IDX_reviews_appointment_id', ['appointment'], { unique: true })
export class Review implements ReviewEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_reviews_id',
  })
  public readonly id!: number

  @ManyToOne(() => Client, (client) => client.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @ManyToOne(() => Provider, (provider) => provider.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @ManyToOne(() => Service, (service) => service.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'service_id' })
  public service!: Service

  @OneToOne(() => Appointment, (appointment) => appointment.review, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'appointment_id' })
  public appointment!: Appointment

  @Column('decimal', { precision: 2, scale: 1, nullable: false })
  public rating!: number

  @Column('text', { nullable: true })
  public comment?: string

  @Column('smallint', { default: ReviewStatusEnum.PENDING })
  public status!: ReviewStatusEnum

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

  @Column('bigint', { nullable: false, name: 'appointment_id' })
  public appointmentId!: number
}
