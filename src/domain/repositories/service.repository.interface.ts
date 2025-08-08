import {
  ServiceEntity,
  ServiceStatusEnum,
} from '@domain/entities/services.entity'

export const SERVICE_REPOSITORY = 'SERVICE_REPOSITORY_INTERFACE'

export interface ISearchServiceParam {
  status?: ServiceStatusEnum
  search?: string
  sortBy?: 'createdAt' | 'name' | 'price'
  sortOrder?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
  providerId?: number
}

export interface IServiceRepository {
  createService(service: Partial<ServiceEntity>): Promise<ServiceEntity>
  getServiceByName(name: string): Promise<ServiceEntity | null>
  updateService(
    params: {
      id: number
      providerId: number
    },
    service: Partial<ServiceEntity>,
  ): Promise<boolean>
  findOnService(payload: {
    id: number
    providerId: number
  }): Promise<ServiceEntity | null>
  getServiceById(id: number): Promise<ServiceEntity | null>
  findServices(
    params: ISearchServiceParam & { providerId?: number },
  ): Promise<ServiceEntity[]>
  findValidServicesByIds(
    serviceIds: number[],
    providerId: number,
  ): Promise<ServiceEntity[]>
}
