import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ChatEntity } from '@domain/entities/chats.entity'
import {
  IChatRepository,
  ISearchChatParam,
} from '@domain/repositories/chat.repository.interface'

import { Chat } from '../entities/chats.entity'

@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  create(chat: Partial<ChatEntity>) {
    return this.chatRepository.create(chat)
  }

  async save(entity: ChatEntity): Promise<ChatEntity> {
    return this.chatRepository.save(entity)
  }

  async updateChat(id: number, chat: Partial<ChatEntity>) {
    const upChat = await this.chatRepository.update(
      {
        id,
      },
      chat,
    )

    if (upChat.affected === 0) return false

    return true
  }

  async markChatsAsRead(chatIds: number[], userId: number, senderId: number) {
    const result = await this.chatRepository
      .createQueryBuilder()
      .update(Chat)
      .set({ isRead: true })
      .where('id IN (:...chatIds)', { chatIds })
      .andWhere('receiver_id = :userId', { userId })
      .andWhere('sender_id = :senderId', { senderId })
      .execute()

    if (result.affected === 0 || result.affected === chatIds.length)
      return false

    return true
  }

  async findChatById(id: number) {
    return this.chatRepository.findOne({
      where: { id },
    })
  }

  async findChats(params: ISearchChatParam & { userId: number }) {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .select([
        'chat.id',
        'chat.message',
        'chat.senderId',
        'chat.receiverId',
        'chat.isRead',
      ])
      .where('chat.senderId = :userId OR chat.receiverId = :userId', {
        userId: params.userId,
      })

    if (params.isRead !== undefined) {
      query.andWhere('chat.isRead = :isRead', { isRead: params.isRead })
    }

    if (params.search?.trim()) {
      query.andWhere('chat.message ILIKE :search ', {
        search: `%${params.search}%`,
      })
    }

    query.orderBy(`chat.id`, params.sortOrder)
    query.skip(params.offset).take(params.limit)

    return query.getMany()
  }
}
