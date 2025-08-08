import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  RoleEnum,
  UserEntity,
  UserStatusEnum,
} from '@domain/entities/user.entity'

import { Appointment } from './appointments.entity'
import { Chat } from './chats.entity'
import { Client } from './clients.entity'
import { Notification } from './notifications.entity'
import { Provider } from './providers.entity'
import { RefundRequest } from './refund_request.entity'

@Entity('users')
@Index('IDX_users_email', ['email'], { unique: true })
@Index('IDX_users_role', ['role'])
@Index('IDX_users_username', ['username'], { unique: true })
export class User implements UserEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_user_id',
  })
  public readonly id!: number

  @Column('varchar', { length: 225, nullable: false, name: 'user_name' })
  public username!: string

  @Column('varchar', { length: 255, unique: true, nullable: false })
  public email!: string

  @Column('varchar', { length: 255, nullable: false })
  password!: string

  @Column('timestamp', { name: 'last_login', nullable: true })
  public lastLogin?: Date

  @Column('smallint', { nullable: false })
  public role!: RoleEnum

  @Column('smallint', { default: UserStatusEnum.PENDING })
  public status!: UserStatusEnum

  @OneToOne(() => Provider, (provider) => provider.user)
  provider?: Provider

  @OneToOne(() => Client, (client) => client.user)
  client?: Client

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications?: Notification[]

  @OneToMany(() => Chat, (chat) => chat.receiver)
  receivers?: Chat[]

  @OneToMany(() => Chat, (chat) => chat.sender)
  senders?: Chat[]

  @OneToMany(() => RefundRequest, (refundRequest) => refundRequest.client)
  refundRequests?: RefundRequest[]

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  appointments?: Appointment[]

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date
}
