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

import { ChatEntity } from '@domain/entities/chats.entity'

import { User } from './user.entity'

@Entity('chats')
@Index('IDX_chats_sender_id', ['sender'])
@Index('IDX_chats_receiver_id', ['receiver'])
@Index('IDX_chats_sender_receiver', ['sender', 'receiver'])
export class Chat implements ChatEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_chats_id',
  })
  public readonly id!: number

  @ManyToOne(() => User, (user) => user.senders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  public sender!: User

  @ManyToOne(() => User, (user) => user.receivers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  public receiver!: User

  @Column('text', { nullable: true })
  public message!: string

  @Column('boolean', { default: false, name: 'is_read' })
  public isRead!: boolean

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  @Column('bigint', { nullable: false, name: 'sender_id' })
  public senderId!: number

  @Column('bigint', { nullable: false, name: 'receiver_id' })
  public receiverId!: number
}
