import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EXCEPTIONS } from '@domain/exceptions/exceptions.interface'
import { CHAT_REPOSITORY } from '@domain/repositories/chat.repository.interface'
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface'

import { CreateChatUseCase } from '@use-cases/chat/create-chat.use-case'
import { EditChatMessageUseCase } from '@use-cases/chat/edit-chat-message.use-case'
import { GetListChatUseCase } from '@use-cases/chat/get-list-chat.use-case'
import { UpdateChatReadUseCase } from '@use-cases/chat/update-chat-read.use-case'

import { ChatController } from '@adapters/controllers/chat/chat.controller'
import { ChatGateway } from '@adapters/gateways/chat/chat.gateway'

import { Chat } from '@infrastructure/databases/postgressql/entities/chats.entity'
import { User } from '@infrastructure/databases/postgressql/entities/user.entity'
import { ChatRepository } from '@infrastructure/databases/postgressql/repositories/chat.repository'
import { UserRepository } from '@infrastructure/databases/postgressql/repositories/user.repository'
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat])],
  controllers: [ChatController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: CHAT_REPOSITORY,
      useClass: ChatRepository,
    },
    {
      provide: EXCEPTIONS,
      useClass: ExceptionsService,
    },
    CreateChatUseCase,
    UpdateChatReadUseCase,
    EditChatMessageUseCase,
    GetListChatUseCase,
    ChatGateway,
  ],
})
export class ChatModule {}
