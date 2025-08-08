import { Inject, Injectable } from '@nestjs/common'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CHAT_REPOSITORY,
  IChatRepository,
} from '@domain/repositories/chat.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class CreateChatUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: {
    fromUserId: number
    toUserId: number
    message: string
  }) {
    const fromUserId = await this.checkUser(payload.fromUserId)
    const toUserId = await this.checkUser(payload.toUserId)

    const chatEntity = this.chatRepository.create({
      senderId: fromUserId.id,
      receiverId: toUserId.id,
      message: payload.message,
    })

    return this.chatRepository.save(chatEntity)
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not found',
        message: 'User not found',
      })
    }

    return user
  }
}
