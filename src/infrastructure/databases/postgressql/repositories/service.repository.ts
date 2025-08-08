import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { In, Not, Repository } from 'typeorm'

import {
  ServiceEntity,
  ServiceStatusEnum,
} from '@domain/entities/services.entity'
import {
  ISearchServiceParam,
  IServiceRepository,
} from '@domain/repositories/service.repository.interface'

import { Service } from '../entities/services.entity'

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async createService(service: Partial<Service>) {
    const data = this.serviceRepository.create(service)
    return await this.serviceRepository.save(data)
  }

  async getServiceByName(name: string) {
    return await this.serviceRepository.findOne({
      where: { name },
    })
  }
  async updateService(
    { id, providerId }: { id: number; providerId: number },
    service: Partial<ServiceEntity>,
  ) {
    const upService = await this.serviceRepository.update(
      {
        id: id,
        providerId: providerId,
      },
      service,
    )

    if (upService.affected === 0) return false

    return true
  }

  async findOnService({ id, providerId }: { id: number; providerId: number }) {
    return await this.serviceRepository.findOne({
      where: {
        id: id,
        providerId: providerId,
      },
    })
  }

  async getServiceById(id: number) {
    return await this.serviceRepository.findOne({
      where: { id: id },
    })
  }

  async findServices(params: ISearchServiceParam & { providerId?: number }) {
    const query = this.serviceRepository
      .createQueryBuilder('services')
      .leftJoin('services.provider', 'provider')
      .select([
        'services.id',
        'services.name',
        'services.description',
        'services.price',
        'services.status',
        'services.providerId',
        'services.createdAt',
      ])

    if (params.providerId) {
      query.andWhere('services.providerId = :providerId', {
        providerId: params.providerId,
      })
    }

    if (params.status) {
      query.andWhere('services.status = :status', { status: params.status })
    }

    if (params.search?.trim()) {
      query.andWhere(
        '(services.name ILIKE :search OR services.description ILIKE :search)',
        { search: `%${params.search}%` },
      )
    }

    query.orderBy(`services.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }

  async findValidServicesByIds(
    serviceIds: number[],
    providerId: number,
  ): Promise<ServiceEntity[]> {
    return this.serviceRepository.find({
      where: {
        id: In(serviceIds),
        providerId,
        status: Not(ServiceStatusEnum.INACTIVE),
      },
    })
  }
}
