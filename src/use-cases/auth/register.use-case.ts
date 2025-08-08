import { Inject, Injectable } from '@nestjs/common'

import { RoleEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import {
  BCRYPT_SERVICE,
  IBcryptService,
} from '@domain/services/bcrypt.interface'
import { IJwtService, JWT_SERVICE } from '@domain/services/jwt.interface'

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(BCRYPT_SERVICE)
    private readonly bcryptService: IBcryptService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
    @Inject(USER_REPOSITORY)
    private readonly userRepositoty: IUserRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: {
    username: string
    password: string
    email: string
    role: RoleEnum
  }) {
    await this.validateUniqueEmail(payload.email)

    const user = await this.createUser(payload)

    return user
  }

  private async validateUniqueEmail(email: string) {
    const existingUser = await this.userRepositoty.getUserByEmail(email)

    if (existingUser) {
      throw this.exceptionsService.badRequestException({
        type: 'BadResquest',
        message: 'Email already exists',
      })
    }
  }

  private async createUser(payload: {
    username: string
    password: string
    email: string
    role: RoleEnum
  }) {
    const hashPassword = await this.bcryptService.hash(payload.password)

    const user = await this.userRepositoty.createUser({
      username: payload.username,
      email: payload.email,
      password: hashPassword,
      role: payload.role,
    })

    return user
  }
}
