import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { endOfDay, startOfDay } from 'date-fns'
import { Repository } from 'typeorm'

import { RoleEnum, UserEntity } from '@domain/entities/user.entity'
import {
  ISearchUserParams,
  IUserRepository,
} from '@domain/repositories/user.repository.interface'

import { User } from '../entities/user.entity'

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
  ) {}

  async getUserByUsername(username: string) {
    return await this.userEntityRepository.findOne({
      where: {
        username,
      },
    })
  }

  async getUserById(id: number) {
    return await this.userEntityRepository.findOne({
      where: {
        id,
      },
    })
  }

  async updateLastLogin(id: number) {
    await this.userEntityRepository.update(
      {
        id,
      },
      { lastLogin: () => 'CURRENT_TIMESTAMP' },
    )
  }

  async getUserByEmail(email: string) {
    return this.userEntityRepository.findOne({
      where: {
        email,
      },
    })
  }

  async createUser(data: Partial<User>) {
    const user = this.userEntityRepository.create(data)
    return this.userEntityRepository.save(user)
  }

  async updateUser(userId: number, data: Partial<UserEntity>) {
    const upUser = await this.userEntityRepository.update(
      {
        id: userId,
      },
      data,
    )
    if (upUser.affected === 0) return false

    return true
  }

  async getAdminUser() {
    return await this.userEntityRepository.find({
      where: { role: RoleEnum.ADMIN },
    })
  }

  async findUsers(params: Partial<ISearchUserParams>) {
    const query = this.userEntityRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.lastLogin',
        'user.role',
        'user.status',
        'user.createdAt',
      ])

    if (params.userId) {
      query.andWhere('user.id = :id', { id: params.userId })
    }

    if (params.role) {
      query.andWhere('user.role = :role', { role: params.role })
    }

    if (params.status) {
      query.andWhere('user.status = :status', { status: params.status })
    }

    if (params.dateLogin) {
      const startDate = startOfDay(params.dateLogin)
      const endDate = endOfDay(params.dateLogin)
      query.andWhere('user.lastLogin BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
    }

    query.orderBy(`user.${params.sortBy}`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }
}
