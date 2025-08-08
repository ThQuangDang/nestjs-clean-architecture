import { Inject, Injectable } from '@nestjs/common'

import { EXCEPTIONS, IException } from '@domain/exceptions/exceptions.interface'
import {
  CHAT_REPOSITORY,
  IChatRepository,
  ISearchChatParam,
} from '@domain/repositories/chat.repository.interface'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface'

@Injectable()
export class GetListChatUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
    @Inject(EXCEPTIONS)
    private readonly exceptionsService: IException,
  ) {}

  async execute(queryParams: ISearchChatParam & { userId: number }) {
    await this.checkUser(queryParams.userId)

    return await this.chatRepository.findChats(queryParams)
  }

  private async checkUser(userId: number) {
    const user = await this.userRepository.getUserById(userId)

    if (!user) {
      throw this.exceptionsService.notFoundException({
        type: 'Not Found',
        message: 'User not found',
      })
    }

    return user
  }
}
