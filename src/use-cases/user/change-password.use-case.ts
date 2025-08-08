import { Inject, Injectable } from '@nestjs/common'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import {
  BCRYPT_SERVICE,
  IBcryptService,
} from '@domain/services/bcrypt.interface'

import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(BCRYPT_SERVICE)
    private readonly bcryptService: IBcryptService,
  ) {}

  async execute(payload: {
    userId: number
    currentPassword: string
    newPassword: string
  }): Promise<boolean> {
    const user = await this.checkCurrentPassword(
      payload.userId,
      payload.currentPassword,
    )

    const hashPassword = await this.bcryptService.hash(payload.newPassword)

    return await this.userRepository.updateUser(user.id, {
      password: hashPassword,
    })
  }

  private async checkCurrentPassword(
    userId: number,
    currentPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'NotFound',
        message: 'User not found',
      })
    }

    const passwordMatches = await this.bcryptService.compare(
      currentPassword,
      user.password,
    )

    if (!passwordMatches) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'Password is incorrect',
      })
    }

    return user
  }
}
