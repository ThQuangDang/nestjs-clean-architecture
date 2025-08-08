import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { PromotionUsageEntity } from '@domain/entities/promotions_usage.entity'

import { Appointment } from './appointments.entity'
import { Client } from './clients.entity'
import { Promotion } from './promotions.entity'

@Entity('promotion_usage')
@Index('IDX_promotion_usage_promotion_id', ['promotion'])
@Index('IDX_promotion_usage_client_id', ['client'])
@Index('IDX_promotion_usage_promotion_client', ['promotion', 'client'], {
  unique: true,
})
export class PromotionUsage implements PromotionUsageEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_promotion_usage_id',
  })
  public readonly id!: number

  @ManyToOne(() => Promotion, (promotion) => promotion.promotionUsages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'promotion_id' })
  public promotion!: Promotion

  @ManyToOne(() => Client, (client) => client.promotionUsages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @ManyToOne(() => Appointment, (appointment) => appointment.promotionUsages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'appointment_id' })
  public appointment!: Appointment

  @CreateDateColumn({ name: 'used_at' })
  public readonly usedAt!: Date

  @Column('bigint', { nullable: false, name: 'promotion_id' })
  public promotionId!: number

  @Column('bigint', { nullable: false, name: 'client_id' })
  public clientId!: number

  @Column('bigint', { nullable: false, name: 'appointment_id' })
  public appointmentId!: number
}
