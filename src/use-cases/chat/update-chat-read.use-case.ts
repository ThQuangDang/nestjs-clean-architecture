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
export class UpdateChatReadUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(payload: {
    chatIds: number[]
    receiverId: number
    senderId: number
  }) {
    const upChat = await this.chatRepository.markChatsAsRead(
      payload.chatIds,
      payload.receiverId,
      payload.senderId,
    )

    if (!upChat) {
      throw this.exceptionsService.badRequestException({
        type: '',
        message: '',
      })
    }

    return upChat
  }
}
