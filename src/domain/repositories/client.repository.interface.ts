import { ClientEntity } from '@domain/entities/clients.entity'
import { RoleEnum } from '@domain/entities/user.entity'

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY_INTERFACE'

export interface IProfileUserPayload {
  id: number
  email: string
  username: string
  role: RoleEnum
  userid: number
}

export interface IClientRepository {
  findClientByUserId(userId: number): Promise<IProfileUserPayload | undefined>
  createClient(data: Partial<ClientEntity>): Promise<ClientEntity>
  getClientById(id: number): Promise<IProfileUserPayload | undefined>
  findClientByIds(id: number[]): Promise<IProfileUserPayload[] | undefined>
  deleteClientByUserId(userId: number): Promise<void>
}
