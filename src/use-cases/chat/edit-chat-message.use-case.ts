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
export class EditChatMessageUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,

    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: { userId: number; chatId: number; message: string }) {
    const user = await this.checkUser(payload.userId)

    const chat = await this.checkChat(payload.chatId, user.id)

    chat.message = payload.message
    return this.chatRepository.save(chat)
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

  private async checkChat(chatId: number, userId: number) {
    const chat = await this.chatRepository.findChatById(chatId)
    if (!chat) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'Chat message not found',
      })
    }

    if (chat.senderId !== userId) {
      throw this.exceptionsService.forbiddenException({
        type: 'Forbidden',
        message: 'You are not authorized to edit this message',
      })
    }

    return chat
  }
}
