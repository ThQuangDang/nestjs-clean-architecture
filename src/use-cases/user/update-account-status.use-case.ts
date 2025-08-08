import { Inject, Injectable } from '@nestjs/common'

import { UserStatusEnum } from '@domain/entities/user.entity'
import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'
import { GMAIL_SERVICE, IGmailService } from '@domain/services/gmail.interface'

import { User } from '@infrastructure/databases/postgressql/entities/user.entity'

@Injectable()
export class UpdateAccountStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
    @Inject(GMAIL_SERVICE)
    private readonly gmailService: IGmailService,
  ) {}

  async execute(
    param: { userId: number },
    payload: { status: UserStatusEnum },
  ): Promise<boolean> {
    const user = await this.checkUser(param.userId)

    this.checkStatus(payload.status, user.status)

    const updateStatus = await this.userRepository.updateUser(user.id, {
      status: payload.status,
    })

    await this.sendMail(user.username, user.email, payload.status)

    return updateStatus
  }

  private async checkUser(id: number): Promise<User> {
    const user = await this.userRepository.getUserById(id)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    return user
  }

  private async sendMail(
    username: string,
    email: string,
    nextStatus: UserStatusEnum,
  ): Promise<void> {
    if (nextStatus === UserStatusEnum.REJECTED) {
      await this.gmailService.sendMailRejectToUser({
        email,
        username,
      })
    } else {
      await this.gmailService.sendMailApprovToUser({
        email,
        username,
      })
    }
  }

  private checkStatus(
    currentStatus: UserStatusEnum,
    nextStatus: UserStatusEnum,
  ) {
    if (currentStatus === nextStatus) {
      throw this.exceptionsService.badRequestException({
        type: 'BadRequest',
        message: `This account has been update by you with currentStatus: ${currentStatus}`,
      })
    }
  }
}
