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

import { RevenueEntity } from '@domain/entities/revenues.entity'

import { Provider } from './providers.entity'

@Entity('revenues')
@Index('IDX_revenues_provider_id', ['provider'])
@Index('IDX_revenues_month', ['month'])
@Index('IDX_revenues_provider_month', ['provider', 'month'])
export class Revenue implements RevenueEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_revenues_id',
  })
  public readonly id!: number

  @ManyToOne(() => Provider, (provider) => provider.revenues, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'total_income',
  })
  public totalIncome!: number

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  public commission!: number

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'net_income',
  })
  public netIncome!: number

  @Column('date', { nullable: false })
  public month!: Date

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number
}
