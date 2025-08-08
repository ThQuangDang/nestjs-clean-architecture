import { ProviderEntity } from '@domain/entities/providers.entity'

import { IProfileUserPayload } from './client.repository.interface'

export const PROVIDER_REPOSITORY = 'PROVIDER_REPOSITORY_INTERFACE'

export interface IProviderRepository {
  findProviderByUserId(userId: number): Promise<ProviderEntity | null>
  createProvider(data: Partial<ProviderEntity>): Promise<ProviderEntity>
  getProviderById(id: number): Promise<IProfileUserPayload | undefined>
  findOnProvider(payload: {
    id: number
    userId: number
  }): Promise<ProviderEntity | null>
  updateProvider(
    params: {
      id: number
      userId: number
    },
    provider: Partial<ProviderEntity>,
  ): Promise<boolean>
  deleteProviderByUserId(userId: number): Promise<void>
}
