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
  NotificationEntity,
  NotificationTypeEnum,
} from '@domain/entities/notifications.entity'

import { User } from './user.entity'

@Entity('notifications')
@Index('IDX_notifications_user_id', ['user'])
@Index('IDX_notifications_type', ['type'])
export class Notification implements NotificationEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_notifications_id',
  })
  public readonly id!: number

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  public user!: User

  @Column('smallint', {
    default: NotificationTypeEnum.WEB,
  })
  public type!: NotificationTypeEnum

  @Column('varchar', { length: 255, nullable: false })
  public title!: string

  @Column('text', { nullable: false })
  public message!: string

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'user_id' })
  public userId!: number
}
