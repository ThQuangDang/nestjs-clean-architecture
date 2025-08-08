import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { FavouriteEntity } from '@domain/entities/favourites.entity'

import { Client } from './clients.entity'
import { Service } from './services.entity'

@Entity('favourites')
@Index('IDX_favourites_client', ['client'])
@Index('IDX_favourites_serivce', ['service'])
@Index('IDX_favourites_client_srevice', ['client', 'service'], { unique: true })
export class Favourite implements FavouriteEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_favourites_id',
  })
  public readonly id!: number

  @ManyToOne(() => Client, (client) => client.favourites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'client_id' })
  public client!: Client

  @ManyToOne(() => Service, (service) => service.favourites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'service_id' })
  public service!: Service

  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt!: Date

  public get clientId(): number {
    return this.client?.id
  }

  public get serviceId(): number {
    return this.service?.id
  }
}
