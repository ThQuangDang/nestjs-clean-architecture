import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  ServiceEntity,
  ServiceStatusEnum,
} from '@domain/entities/services.entity'

import { Appointment } from './appointments.entity'
import { Favourite } from './favourites.entity'
import { PromotionsServices } from './promotions_services.entity'
import { Provider } from './providers.entity'
import { Review } from './reviews.entity'

@Entity('services')
@Index('IDX_services_provider_id', ['provider'])
@Index('IDX_services_name', ['name'], { unique: true })
export class Service implements ServiceEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_service_id',
  })
  public readonly id!: number

  @ManyToOne(() => Provider, (provider) => provider.services, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'provider_id' })
  public provider!: Provider

  @Column('varchar', { length: 255, nullable: false, unique: true })
  public name!: string

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  public rating!: number

  @Column('text', { nullable: true })
  public description?: string

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  public price!: number

  @Column('smallint', {
    default: ServiceStatusEnum.ACTIVE,
  })
  public status!: ServiceStatusEnum

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments?: Appointment[]

  @OneToMany(() => Review, (review) => review.service)
  reviews?: Review[]

  @OneToMany(() => Favourite, (favourite) => favourite.service)
  favourites?: Favourite[]

  @OneToMany(
    () => PromotionsServices,
    (promotionService) => promotionService.service,
  )
  promotionServices?: PromotionsServices[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'provider_id' })
  public providerId!: number
}
