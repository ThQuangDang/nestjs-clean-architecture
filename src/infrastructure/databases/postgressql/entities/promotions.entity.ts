import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import {
  PromotionEntity,
  PromotionStatusEnum,
} from '@domain/entities/promotions.entity'

import { PromotionsServices } from './promotions_services.entity'
import { PromotionUsage } from './promotions_usage.entity'
import { Provider } from './providers.entity'

@Entity('promotions')
@Index('IDX_promotions_provider_id', ['provider'])
@Index('IDX_promotions_discount_code', ['discountCode'], { unique: true })
@Index('IDX_promotions_provider_status', ['provider', 'status'])
export class Promotion implements PromotionEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_promotions_id',
  })
  public readonly id!: number

  @ManyToOne(() => Provider, (provider) => provider.promotions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @Column('varchar', { length: 225, nullable: false })
  public name!: string

  @Column('decimal', { precision: 5, scale: 2, nullable: false })
  public discount!: number

  @Column('varchar', {
    length: 225,
    nullable: false,
    unique: true,
    name: 'discount_code',
  })
  public discountCode!: string

  @Column('int', { nullable: false, name: 'max_usage' })
  public maxUsage!: number

  @Column('int', { default: 0, nullable: false, name: 'use_count' })
  public useCount!: number

  @Column('date', { nullable: false, name: 'start_date' })
  public startDate!: Date

  @Column('date', { nullable: false, name: 'end_date' })
  public endDate!: Date

  @Column('smallint', { default: PromotionStatusEnum.ACTIVE })
  public status!: PromotionStatusEnum

  @OneToMany(
    () => PromotionsServices,
    (promotionService) => promotionService.promotion,
  )
  promotionServices?: PromotionsServices[]

  @OneToMany(() => PromotionUsage, (promotionUsage) => promotionUsage.promotion)
  promotionUsages?: PromotionUsage[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number
}
