import { Inject } from '@nestjs/common'

import { randomBytes } from 'crypto'

import { RoleEnum, UserStatusEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import {
  BCRYPT_SERVICE,
  IBcryptService,
} from '@domain/services/bcrypt.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'
import { RoleUtils } from '@domain/utils/role.utils'

import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

export class CreateAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(BCRYPT_SERVICE)
    private readonly bcryptService: IBcryptService,
  ) {}

  async execute(payload: {
    email: string
    username: string
    role: RoleEnum
  }): Promise<User> {
    await this.validateUniqueEmail(payload.email)

    const tempPassword = this.generateTempPassword()
    const hashPassword = await this.bcryptService.hash(tempPassword)

    const user = await this.userRepository.createUser({
      email: payload.email,
      username: payload.username,
      password: hashPassword,
      role: payload.role,
      status: UserStatusEnum.APPROVED,
    })

    await this.sendMail(user, tempPassword)

    return user
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    const existingEmail = await this.userRepository.getUserByEmail(email)

    if (existingEmail) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: 'Email already exist',
      })
    }
  }

  private generateTempPassword(): string {
    return randomBytes(8).toString('hex')
  }

  private async sendMail(user: User, tempPassword: string): Promise<void> {
    await this.gmailService.sendMailToUser({
      userId: user.id,
      email: user.email,
      username: user.username,
      password: tempPassword,
      role: RoleUtils.getRoleName(user.role),
    })
  }
}
