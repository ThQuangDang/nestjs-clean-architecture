import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ProviderEntity } from '@domain/entities/providers.entity'
import { IProfileUserPayload } from '@domain/repositories/client.repository.interface'
import { IProviderRepository } from '@domain/repositories/provider.repository.interface'

import { Provider } from '../entities/providers.entity'

@Injectable()
export class ProviderRepository implements IProviderRepository {
  constructor(
    @InjectRepository(Provider)
    private readonly providerEntityRepository: Repository<Provider>,
  ) {}

  async findProviderByUserId(userId: number) {
    return this.providerEntityRepository.findOne({
      where: { user: { id: userId } },
    })
  }

  async getProviderById(id: number): Promise<IProfileUserPayload | undefined> {
    return this.providerEntityRepository
      .createQueryBuilder('provider')
      .innerJoin('provider.user', 'user')
      .select([
        'provider.id AS id',
        'user.email AS email',
        'user.username AS username',
        'user.role AS role',
        'user.id AS userid',
      ])
      .where('provider.id = :id', { id })
      .getRawOne()
  }

  async createProvider(data: Partial<Provider>) {
    const provider = this.providerEntityRepository.create(data)
    return this.providerEntityRepository.save(provider)
  }

  async deleteProviderByUserId(userId: number): Promise<void> {
    await this.providerEntityRepository.delete({ user: { id: userId } })
  }

  async findOnProvider({
    id,
    userId,
  }: {
    id: number
    userId: number
  }): Promise<ProviderEntity | null> {
    return await this.providerEntityRepository.findOne({
      where: {
        id: id,
        userId: userId,
      },
    })
  }

  async updateProvider(
    {
      id,
      userId,
    }: {
      id: number
      userId: number
    },
    provider: Partial<ProviderEntity>,
  ): Promise<boolean> {
    const updatedProvider = await this.providerEntityRepository.update(
      {
        id: id,
        userId: userId,
      },
      provider,
    )

    if (updatedProvider.affected === 0) return false

    return true
  }
}
