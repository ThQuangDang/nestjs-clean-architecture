import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ClientEntity } from '@domain/entities/clients.entity'
import {
  IClientRepository,
  IProfileUserPayload,
} from '@domain/repositories/client.repository.interface'

import { Client } from '../entities/clients.entity'

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly clientEntityRepository: Repository<Client>,
  ) {}

  async findClientByUserId(
    userId: number,
  ): Promise<IProfileUserPayload | undefined> {
    return this.clientEntityRepository
      .createQueryBuilder('client')
      .innerJoin('client.user', 'user')
      .select([
        'client.id AS id',
        'user.email AS email',
        'user.username AS username',
        'user.role AS role',
        'user.id AS userid',
      ])
      .where('user.id = :userId', { userId })
      .getRawOne()
  }

  async getClientById(id: number): Promise<IProfileUserPayload | undefined> {
    return this.clientEntityRepository
      .createQueryBuilder('client')
      .innerJoin('client.user', 'user')
      .select([
        'client.id AS id',
        'user.email AS email',
        'user.username AS username',
        'user.role AS role',
        'user.id AS userid',
      ])
      .where('client.id = :id', { id })
      .getRawOne()
  }

  async createClient(data: Partial<ClientEntity>) {
    const client = this.clientEntityRepository.create(data)
    return this.clientEntityRepository.save(client)
  }

  async deleteClientByUserId(userId: number) {
    await this.clientEntityRepository.delete({ user: { id: userId } })
  }

  async findClientByIds(id: number[]) {
    return this.clientEntityRepository
      .createQueryBuilder('client')
      .innerJoin('client.user', 'user')
      .select([
        'client.id AS id',
        'user.email AS email',
        'user.username AS username',
        'user.role AS role',
      ])
      .whereInIds(id)
      .getRawMany()
  }
}
