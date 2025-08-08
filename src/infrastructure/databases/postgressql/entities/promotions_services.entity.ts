import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { PromotionServiceEntity } from '@domain/entities/promotions_services.entity'

import { Promotion } from './promotions.entity'
import { Service } from './services.entity'

@Entity('promotions_services')
@Index('IDX_promotions_id', ['promotion'])
@Index('IDX_service_id', ['service'])
@Index('IDX_promotions_service', ['promotion', 'service'], {
  unique: true,
})
export class PromotionsServices implements PromotionServiceEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_promotions_services_id',
  })
  public readonly id!: number
  @ManyToOne(() => Promotion, (promotion) => promotion.promotionServices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'promotion_id' })
  public promotion!: Promotion

  @ManyToOne(() => Service, (service) => service.promotionServices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'service_id' })
  public service!: Service

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @Column('bigint', { nullable: false, name: 'promotion_id' })
  public promotionId!: number

  @Column('bigint', { nullable: false, name: 'service_id' })
  public serviceId!: number
}
