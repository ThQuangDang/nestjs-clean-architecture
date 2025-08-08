import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ProviderEntity } from '@domain/entities/providers.entity'

import { Appointment } from './appointments.entity'
import { Invoice } from './invoices.entity'
import { Payment } from './payments.entity'
import { Promotion } from './promotions.entity'
import { Revenue } from './revenues.entity'
import { Review } from './reviews.entity'
import { Service } from './services.entity'
import { User } from './user.entity'

@Entity('providers')
@Index('IDX_providers_user_id', ['user'], { unique: true })
@Index('IDX_providers_business_name', ['businessName'], { unique: true })
export class Provider implements ProviderEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_providers_id',
  })
  public readonly id!: number

  @OneToOne(() => User, (user) => user.provider, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  public user!: User

  @Column('varchar', { length: 255, nullable: false, name: 'business_name' })
  public businessName!: string

  @Column('text', { nullable: true })
  public description?: string

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  public rating!: number

  @OneToMany(() => Service, (service) => service.provider)
  services?: Service[]

  @OneToMany(() => Appointment, (appointment) => appointment.provider)
  appointments?: Appointment[]

  @OneToMany(() => Payment, (payment) => payment.provider)
  payments?: Payment[]

  @OneToMany(() => Invoice, (invoice) => invoice.provider)
  invoices?: Invoice[]

  @OneToMany(() => Revenue, (revenue) => revenue.provider)
  revenues?: Revenue[]

  @OneToMany(() => Review, (review) => review.provider)
  reviews?: Review[]

  @OneToMany(() => Promotion, (promotion) => promotion.provider)
  promotions?: Promotion[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'user_id' })
  public userId!: number
}
