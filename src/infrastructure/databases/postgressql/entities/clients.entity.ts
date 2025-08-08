import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ClientEntity } from '@domain/entities/clients.entity'

import { Appointment } from './appointments.entity'
import { Favourite } from './favourites.entity'
import { Invoice } from './invoices.entity'
import { Payment } from './payments.entity'
import { PromotionUsage } from './promotions_usage.entity'
import { RefundRequest } from './refund_request.entity'
import { Review } from './reviews.entity'
import { User } from './user.entity'

@Entity('clients')
export class Client implements ClientEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_clients_id',
  })
  public readonly id!: number

  @OneToOne(() => User, (user) => user.client, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  public user!: User

  @Column('varchar', { length: 255, nullable: false, name: 'full_name' })
  public fullName!: string

  @Column('text', { nullable: true })
  public description?: string

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  appointments?: Appointment[]

  @OneToMany(() => Payment, (payment) => payment.client)
  payments?: Payment[]

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices?: Invoice[]

  @OneToMany(() => Review, (review) => review.client)
  reviews?: Review[]

  @OneToMany(() => Favourite, (favourite) => favourite.client)
  favourites?: Favourite[]

  @OneToMany(() => PromotionUsage, (promotionUsage) => promotionUsage.client)
  promotionUsages?: PromotionUsage[]

  @OneToMany(() => RefundRequest, (refundRequest) => refundRequest.client)
  refundRequests?: RefundRequest[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'user_id' })
  public userId!: number
}
